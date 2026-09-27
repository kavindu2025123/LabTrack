const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

// Same ownership pattern used in equipmentService - a Technical Officer
// manages exactly one lab, so we look that lab_id up to confirm they're only
// reporting/resolving tickets for equipment that belongs to them.
async function getOfficerLabId(userId, executor = pool) {
  const result = await executor.query(
    'SELECT lab_id FROM laboratories WHERE technical_officer_id = $1',
    [userId]
  );
  return result.rows.length > 0 ? result.rows[0].lab_id : null;
}

async function listTickets({ status, equipment_id, lab_id }) {
  let query = `
    SELECT m.*, e.name AS equipment_name, u.name AS reported_by_name
    FROM maintenance_tickets m
    JOIN equipment e ON m.equipment_id = e.equipment_id
    LEFT JOIN users u ON m.reported_by = u.user_id
  `;
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`m.status = $${params.length}`);
  }
  if (equipment_id) {
    params.push(equipment_id);
    conditions.push(`m.equipment_id = $${params.length}`);
  }
  if (lab_id) {
    params.push(lab_id);
    conditions.push(`e.lab_id = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY m.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

// Pulls ONE unit out of available_quantity so it can no longer be reserved,
// without touching the units still in good condition.
async function reportIssue(user, { equipment_id, description }) {
  if (!equipment_id || !description) {
    throw new ApiError(400, 'equipment_id and description are required');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const equipResult = await client.query(
      'SELECT lab_id, available_quantity FROM equipment WHERE equipment_id = $1 FOR UPDATE',
      [equipment_id]
    );
    if (equipResult.rows.length === 0) throw new ApiError(404, 'Equipment not found');

    const equip = equipResult.rows[0];

    // A Technical Officer can only report tickets for their own lab's equipment.
    if (user.role === 'Technical_Officer') {
      const officerLabId = await getOfficerLabId(user.user_id, client);
      if (!officerLabId || equip.lab_id !== officerLabId) {
        throw new ApiError(403, 'This equipment does not belong to your laboratory');
      }
    }

    if (equip.available_quantity < 1) {
      throw new ApiError(400, 'No available units left to pull for maintenance');
    }

    const ticketResult = await client.query(
      `INSERT INTO maintenance_tickets (equipment_id, reported_by, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [equipment_id, user.user_id, description]
    );

    await client.query(
      `UPDATE equipment SET available_quantity = available_quantity - 1 WHERE equipment_id = $1`,
      [equipment_id]
    );

    await client.query('COMMIT');
    return ticketResult.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Marks the ticket resolved and returns the ONE unit that was pulled back
// into available_quantity.
async function resolveTicket(user, ticketId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ticketResult = await client.query(
      'SELECT * FROM maintenance_tickets WHERE ticket_id = $1 FOR UPDATE',
      [ticketId]
    );
    if (ticketResult.rows.length === 0) throw new ApiError(404, 'Ticket not found');

    const ticket = ticketResult.rows[0];

    if (ticket.status === 'Resolved') {
      throw new ApiError(400, 'This ticket is already resolved');
    }

    const equipResult = await client.query('SELECT lab_id FROM equipment WHERE equipment_id = $1', [
      ticket.equipment_id,
    ]);

    if (user.role === 'Technical_Officer') {
      const officerLabId = await getOfficerLabId(user.user_id, client);
      if (!officerLabId || equipResult.rows[0]?.lab_id !== officerLabId) {
        throw new ApiError(403, 'This equipment does not belong to your laboratory');
      }
    }

    const updated = await client.query(
      `UPDATE maintenance_tickets
       SET status = 'Resolved', resolved_at = CURRENT_TIMESTAMP
       WHERE ticket_id = $1 RETURNING *`,
      [ticketId]
    );

    // Put the unit back into available_quantity, capped at total_quantity as a safety net
    await client.query(
      `UPDATE equipment
       SET available_quantity = LEAST(available_quantity + 1, total_quantity)
       WHERE equipment_id = $1`,
      [ticket.equipment_id]
    );

    await client.query('COMMIT');
    return updated.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { listTickets, reportIssue, resolveTicket };
