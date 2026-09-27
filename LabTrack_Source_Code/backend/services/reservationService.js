const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function listReservations(user, labId) {
  let query = `
    SELECT 
      r.reservation_id,
      r.reserved_date::text AS reserved_date,
      r.start_time,
      r.end_time,
      r.status,
      r.student_id,
      r.lab_id,
      r.created_at,
      l.name AS lab_name, 
      u.name AS student_name,
      br.record_id,
      br.issued_at,
      br.returned_at,
      f.amount AS fine_amount,
      f.status AS fine_status
    FROM reservations r
    JOIN laboratories l ON r.lab_id = l.lab_id
    JOIN users u ON r.student_id = u.user_id
    LEFT JOIN borrowing_records br ON r.reservation_id = br.reservation_id
    LEFT JOIN fines f ON br.record_id = f.record_id
  `;
  const params = [];

  if (user.role === 'Student') {
    query += ' WHERE r.student_id = $1';
    params.push(user.user_id);
  } else if (labId) {
    query += ' WHERE r.lab_id = $1';
    params.push(labId);
  }

  query += ' ORDER BY r.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

async function getReservation(id) {
  const reservation = await pool.query('SELECT * FROM reservations WHERE reservation_id = $1', [
    id,
  ]);
  if (reservation.rows.length === 0) throw new ApiError(404, 'Reservation not found');

  const items = await pool.query(
    `SELECT ri.*, e.name AS equipment_name
     FROM reservation_items ri
     JOIN equipment e ON ri.equipment_id = e.equipment_id
     WHERE ri.reservation_id = $1`,
    [id]
  );

  return { ...reservation.rows[0], items: items.rows };
}

// Creates a reservation with a cart of equipment items, validating every
// item BEFORE creating anything (bulk-vs-single-unit rule + availability).
async function createReservation(user, { lab_id, reserved_date, start_time, end_time, items }) {
  if (!lab_id || !reserved_date || !start_time || !end_time || !items || items.length === 0) {
    throw new ApiError(400, 'lab_id, date, time and at least one item are required');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of items) {
      const equipResult = await client.query(
        'SELECT name, is_bulk, available_quantity FROM equipment WHERE equipment_id = $1',
        [item.equipment_id]
      );
      if (equipResult.rows.length === 0) {
        throw new ApiError(404, `Equipment ${item.equipment_id} not found`);
      }

      const equip = equipResult.rows[0];
      const qty = item.quantity_requested || 1;

      if (!equip.is_bulk && qty > 1) {
        throw new ApiError(
          400,
          `${equip.name} is not a bulk item — only 1 unit can be requested per reservation`
        );
      }

      if (qty > equip.available_quantity) {
        throw new ApiError(
          400,
          `Only ${equip.available_quantity} unit(s) of ${equip.name} are currently available`
        );
      }
    }

    const reservationResult = await client.query(
      `INSERT INTO reservations (student_id, lab_id, reserved_date, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.user_id, lab_id, reserved_date, start_time, end_time]
    );

    const reservation = reservationResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO reservation_items (reservation_id, equipment_id, quantity_requested)
         VALUES ($1, $2, $3)`,
        [reservation.reservation_id, item.equipment_id, item.quantity_requested || 1]
      );
    }

    await client.query('COMMIT');
    return reservation;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function approveReservation(id) {
  const result = await pool.query(
    `UPDATE reservations SET status = 'Approved' WHERE reservation_id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Reservation not found');
  return result.rows[0];
}

async function rejectReservation(id) {
  const result = await pool.query(
    `UPDATE reservations SET status = 'Rejected' WHERE reservation_id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Reservation not found');
  return result.rows[0];
}

module.exports = {
  listReservations,
  getReservation,
  createReservation,
  approveReservation,
  rejectReservation,
};
