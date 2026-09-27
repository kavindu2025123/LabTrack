const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function listFines(user) {
  let query = 'SELECT * FROM fines';
  const params = [];

  if (user.role === 'Student') {
    query += ' WHERE student_id = $1';
    params.push(user.user_id);
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

async function createFine({ record_id, student_id, amount }) {
  if (!record_id || !student_id || !amount) {
    throw new ApiError(400, 'record_id, student_id and amount are required');
  }

  const result = await pool.query(
    `INSERT INTO fines (record_id, student_id, amount)
     VALUES ($1, $2, $3) RETURNING *`,
    [record_id, student_id, amount]
  );

  return result.rows[0];
}

// NOTE: Simplified for a student project - a real integration would create a
// Stripe PaymentIntent and confirm it client-side before calling this.
async function payFine(user, fineId, stripePaymentId) {
  const fine = await pool.query('SELECT * FROM fines WHERE fine_id = $1', [fineId]);
  if (fine.rows.length === 0) throw new ApiError(404, 'Fine not found');

  if (fine.rows[0].student_id !== user.user_id) {
    throw new ApiError(403, 'This fine does not belong to you');
  }

  const result = await pool.query(
    `UPDATE fines
     SET status = 'Paid', stripe_payment_id = $1
     WHERE fine_id = $2
     RETURNING *`,
    [stripePaymentId || 'test_payment', fineId]
  );

  return result.rows[0];
}

module.exports = { listFines, createFine, payFine };
