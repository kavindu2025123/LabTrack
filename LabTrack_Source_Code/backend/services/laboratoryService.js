const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function listLaboratories() {
  const result = await pool.query(`
    SELECT l.*, d.name AS department_name, u.name AS technical_officer_name
    FROM laboratories l
    LEFT JOIN departments d ON l.department_id = d.department_id
    LEFT JOIN users u ON l.technical_officer_id = u.user_id
    ORDER BY l.lab_id
  `);
  return result.rows;
}

async function listAvailableOfficers() {
  const result = await pool.query(`
    SELECT u.user_id, u.name, u.email
    FROM users u
    WHERE u.role = 'Technical_Officer'
      AND u.user_id NOT IN (
        SELECT technical_officer_id FROM laboratories
        WHERE technical_officer_id IS NOT NULL
      )
    ORDER BY u.name
  `);
  return result.rows;
}

async function getMyLab(userId) {
  const result = await pool.query(
    `SELECT l.*, d.name AS department_name
     FROM laboratories l
     LEFT JOIN departments d ON l.department_id = d.department_id
     WHERE l.technical_officer_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'You are not currently assigned to a laboratory');
  }
  return result.rows[0];
}

async function getLaboratory(id) {
  const result = await pool.query('SELECT * FROM laboratories WHERE lab_id = $1', [id]);
  if (result.rows.length === 0) throw new ApiError(404, 'Laboratory not found');
  return result.rows[0];
}

// A Technical Officer can only be assigned to ONE lab at a time.
async function assertOfficerNotAlreadyAssigned(technicalOfficerId, excludeLabId) {
  if (!technicalOfficerId) return;

  let query = 'SELECT lab_id FROM laboratories WHERE technical_officer_id = $1';
  const params = [technicalOfficerId];

  if (excludeLabId) {
    query += ' AND lab_id != $2';
    params.push(excludeLabId);
  }

  const existing = await pool.query(query, params);
  if (existing.rows.length > 0) {
    throw new ApiError(400, 'This Technical Officer is already assigned to another laboratory');
  }
}

async function createLaboratory({ name, department_id, technical_officer_id }) {
  if (!name) throw new ApiError(400, 'Name is required');

  await assertOfficerNotAlreadyAssigned(technical_officer_id);

  try {
    const result = await pool.query(
      `INSERT INTO laboratories (name, department_id, technical_officer_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, department_id || null, technical_officer_id || null]
    );
    return result.rows[0];
  } catch (err) {
    // Catches the DB-level unique constraint too, as a safety net
    if (err.code === '23505') {
      throw new ApiError(400, 'This Technical Officer is already assigned to another laboratory');
    }
    throw err;
  }
}

async function updateLaboratory(id, { name, department_id, technical_officer_id }) {
  // Ignore the lab currently being edited, in case it's kept the same officer.
  await assertOfficerNotAlreadyAssigned(technical_officer_id, id);

  try {
    const result = await pool.query(
      `UPDATE laboratories
       SET name = COALESCE($1, name),
           department_id = COALESCE($2, department_id),
           technical_officer_id = COALESCE($3, technical_officer_id)
       WHERE lab_id = $4
       RETURNING *`,
      [name, department_id, technical_officer_id, id]
    );
    if (result.rows.length === 0) throw new ApiError(404, 'Laboratory not found');
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      throw new ApiError(400, 'This Technical Officer is already assigned to another laboratory');
    }
    throw err;
  }
}

async function deleteLaboratory(id) {
  const result = await pool.query(
    'DELETE FROM laboratories WHERE lab_id = $1 RETURNING lab_id',
    [id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Laboratory not found');
  return { message: 'Laboratory deleted' };
}

module.exports = {
  listLaboratories,
  listAvailableOfficers,
  getMyLab,
  getLaboratory,
  createLaboratory,
  updateLaboratory,
  deleteLaboratory,
};
