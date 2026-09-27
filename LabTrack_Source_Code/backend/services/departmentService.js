const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function listDepartments() {
  const result = await pool.query('SELECT * FROM departments ORDER BY name');
  return result.rows;
}

async function createDepartment(name) {
  if (!name) throw new ApiError(400, 'Name is required');

  const result = await pool.query(
    'INSERT INTO departments (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
}

async function updateDepartment(id, name) {
  const result = await pool.query(
    'UPDATE departments SET name = $1 WHERE department_id = $2 RETURNING *',
    [name, id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Department not found');
  return result.rows[0];
}

async function deleteDepartment(id) {
  const result = await pool.query(
    'DELETE FROM departments WHERE department_id = $1 RETURNING department_id',
    [id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Department not found');
  return { message: 'Department deleted' };
}

module.exports = { listDepartments, createDepartment, updateDepartment, deleteDepartment };
