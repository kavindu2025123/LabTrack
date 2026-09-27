const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

const DAILY_FINE_RATE = 100.0; // Rate: Rs. 100 per overdue block

// TESTING MODE: overdue block shortened to 5 minutes so fines can be verified
// quickly without waiting 24 hours. Set back to 24 * 60 (1440) for production.
const OVERDUE_BLOCK_MINUTES = 5;

async function listBorrowings(user) {
  let query = `
    SELECT b.*, r.reserved_date, r.lab_id, r.student_id
    FROM borrowing_records b
    JOIN reservations r ON b.reservation_id = r.reservation_id
  `;
  const params = [];

  if (user.role === 'Student') {
    query += ' WHERE r.student_id = $1';
    params.push(user.user_id);
  }

  query += ' ORDER BY b.issued_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

// Technical_Officer/Admin: issue equipment for an approved reservation.
async function issueEquipment(user, { reservation_id }) {
  if (!reservation_id) throw new ApiError(400, 'reservation_id is required');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const reservation = await client.query(
      'SELECT * FROM reservations WHERE reservation_id = $1',
      [reservation_id]
    );
    if (reservation.rows.length === 0) throw new ApiError(404, 'Reservation not found');

    if (reservation.rows[0].status !== 'Approved') {
      throw new ApiError(400, 'Reservation must be Approved before issuing');
    }

    // Reduce available_quantity for each reserved item
    const items = await client.query(
      'SELECT * FROM reservation_items WHERE reservation_id = $1',
      [reservation_id]
    );

    for (const item of items.rows) {
      await client.query(
        `UPDATE equipment
         SET available_quantity = available_quantity - $1
         WHERE equipment_id = $2 AND available_quantity >= $1`,
        [item.quantity_requested, item.equipment_id]
      );
    }

    const record = await client.query(
      `INSERT INTO borrowing_records (reservation_id, issued_by)
       VALUES ($1, $2) RETURNING *`,
      [reservation_id, user.user_id]
    );

    await client.query(
      `UPDATE reservations SET status = 'Completed' WHERE reservation_id = $1`,
      [reservation_id]
    );

    await client.query('COMMIT');
    return record.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Technical_Officer/Admin: mark equipment as returned, restock quantity &
// calculate a fine when returned late (charged per full OVERDUE_BLOCK_MINUTES
// block overdue — currently 5 min for testing, normally 24h).
async function returnEquipment(recordId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const recordResult = await client.query(
      `SELECT b.*, r.student_id, (r.reserved_date + r.end_time)::timestamp AS due_timestamp
       FROM borrowing_records b
       JOIN reservations r ON b.reservation_id = r.reservation_id
       WHERE b.record_id = $1
       FOR UPDATE`,
      [recordId]
    );
    if (recordResult.rows.length === 0) throw new ApiError(404, 'Borrowing record not found');

    const record = recordResult.rows[0];

    if (record.returned_at) {
      throw new ApiError(400, 'Equipment has already been returned');
    }

    // Restock equipment stock for each reserved item
    const items = await client.query(
      'SELECT * FROM reservation_items WHERE reservation_id = $1',
      [record.reservation_id]
    );

    for (const item of items.rows) {
      await client.query(
        `UPDATE equipment
         SET available_quantity = available_quantity + $1
         WHERE equipment_id = $2`,
        [item.quantity_requested, item.equipment_id]
      );
    }

    const updatedResult = await client.query(
      `UPDATE borrowing_records 
       SET returned_at = CURRENT_TIMESTAMP
       WHERE record_id = $1 
       RETURNING *`,
      [recordId]
    );

    const updatedRecord = updatedResult.rows[0];
    const returnedAt = new Date(updatedRecord.returned_at);
    const dueTimestamp = new Date(record.due_timestamp);

    let fineAmount = 0;
    let daysLate = 0;

    // Overdue check: charge Rs. 100 for every full overdue block
    // (OVERDUE_BLOCK_MINUTES minutes — currently 5 for testing, normally 1440/24h)
    if (returnedAt > dueTimestamp) {
      const diffInMs = returnedAt.getTime() - dueTimestamp.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);

      // Math.floor calculates full overdue blocks elapsed
      daysLate = Math.floor(diffInMinutes / OVERDUE_BLOCK_MINUTES);
      fineAmount = daysLate * DAILY_FINE_RATE;

      // Insert into fines table only if fineAmount > 0 (late by one full block or more)
      if (fineAmount > 0) {
        await client.query(
          `INSERT INTO fines (record_id, student_id, amount, status)
           VALUES ($1, $2, $3, 'Unpaid')`,
          [recordId, record.student_id, fineAmount]
        );
      }
    }

    await client.query('COMMIT');

    // Return record with fine response data for frontend alerts
    return { ...updatedRecord, fineAmount, daysLate };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { listBorrowings, issueEquipment, returnEquipment };