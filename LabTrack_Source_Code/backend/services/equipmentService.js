const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

// A Technical Officer manages exactly one lab. This looks up that lab_id so
// we can confirm they're only touching equipment that belongs to them.
async function getOfficerLabId(userId) {
  const result = await pool.query(
    'SELECT lab_id FROM laboratories WHERE technical_officer_id = $1',
    [userId]
  );
  return result.rows.length > 0 ? result.rows[0].lab_id : null;
}

// ---------- Equipment Categories ----------
// Categories aren't tied to a specific lab in the schema, so any
// Admin or Technical_Officer can manage the shared category list.

async function listCategories() {
  const result = await pool.query('SELECT * FROM equipment_categories ORDER BY name');
  return result.rows;
}

async function createCategory(name) {
  if (!name) throw new ApiError(400, 'Name is required');

  const result = await pool.query(
    'INSERT INTO equipment_categories (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
}

async function updateCategory(id, name) {
  if (!name) throw new ApiError(400, 'Name is required');

  const result = await pool.query(
    'UPDATE equipment_categories SET name = $1 WHERE category_id = $2 RETURNING *',
    [name, id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Category not found');
  return result.rows[0];
}

async function deleteCategory(id) {
  const result = await pool.query(
    'DELETE FROM equipment_categories WHERE category_id = $1 RETURNING category_id',
    [id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Category not found');
  return { message: 'Category deleted' };
}

// ---------- Equipment ----------

async function listEquipment(labId) {
  let query = `
    SELECT
      e.*,
      c.name AS category_name,
      l.name AS lab_name,

      -- Approved reservations for this equipment that haven't been issued yet
      COALESCE((
        SELECT SUM(ri.quantity_requested)
        FROM reservation_items ri
        JOIN reservations r ON ri.reservation_id = r.reservation_id
        WHERE ri.equipment_id = e.equipment_id AND r.status = 'Approved'
      ), 0) AS reserved_qty,

      -- Issued and not yet returned
      COALESCE((
        SELECT SUM(ri.quantity_requested)
        FROM reservation_items ri
        JOIN reservations r ON ri.reservation_id = r.reservation_id
        JOIN borrowing_records br ON br.reservation_id = r.reservation_id
        WHERE ri.equipment_id = e.equipment_id AND br.returned_at IS NULL
      ), 0) AS issued_qty,

      -- One open maintenance ticket = one unit currently pulled for repair
      COALESCE((
        SELECT COUNT(*)
        FROM maintenance_tickets mt
        WHERE mt.equipment_id = e.equipment_id AND mt.status = 'Open'
      ), 0) AS maintenance_qty

    FROM equipment e
    LEFT JOIN equipment_categories c ON e.category_id = c.category_id
    LEFT JOIN laboratories l ON e.lab_id = l.lab_id
  `;
  const params = [];

  if (labId) {
    query += ' WHERE e.lab_id = $1';
    params.push(labId);
  }

  query += ' ORDER BY e.equipment_id';

  const result = await pool.query(query, params);
  return result.rows;
}

async function getEquipment(id) {
  const result = await pool.query('SELECT * FROM equipment WHERE equipment_id = $1', [id]);
  if (result.rows.length === 0) throw new ApiError(404, 'Equipment not found');
  return result.rows[0];
}

async function createEquipment(user, { name, category_id, is_bulk, total_quantity, lab_id }) {
  if (!name) throw new ApiError(400, 'name is required');

  // A Technical Officer can only add equipment to their own lab,
  // regardless of what lab_id the client sends.
  if (user.role === 'Technical_Officer') {
    const officerLabId = await getOfficerLabId(user.user_id);
    if (!officerLabId) throw new ApiError(403, 'You are not assigned to a laboratory');
    lab_id = officerLabId;
  }

  if (!lab_id) throw new ApiError(400, 'lab_id is required');

  const qty = total_quantity || 1;

  const result = await pool.query(
    `INSERT INTO equipment (name, category_id, lab_id, is_bulk, total_quantity, available_quantity)
     VALUES ($1, $2, $3, $4, $5, $5)
     RETURNING *`,
    [name, category_id || null, lab_id, is_bulk || false, qty]
  );

  return result.rows[0];
}

// A Technical Officer can only touch equipment that belongs to their own lab.
async function assertOfficerOwnsEquipment(user, equipmentId) {
  if (user.role !== 'Technical_Officer') return;

  const officerLabId = await getOfficerLabId(user.user_id);
  const existing = await pool.query('SELECT lab_id FROM equipment WHERE equipment_id = $1', [
    equipmentId,
  ]);
  if (existing.rows.length === 0) throw new ApiError(404, 'Equipment not found');
  if (!officerLabId || existing.rows[0].lab_id !== officerLabId) {
    throw new ApiError(403, 'This equipment does not belong to your laboratory');
  }
}

async function updateEquipment(user, id, body) {
  await assertOfficerOwnsEquipment(user, id);

  const { name, category_id, total_quantity, available_quantity, status, is_bulk } = body;

  // Normalize explicitly so an omitted field (undefined) becomes SQL NULL,
  // which COALESCE then correctly falls back on.
  const isBulkParam = typeof is_bulk === 'boolean' ? is_bulk : null;

  const result = await pool.query(
    `UPDATE equipment
     SET name = COALESCE($1, name),
         category_id = COALESCE($2, category_id),
         is_bulk = COALESCE($7, is_bulk),
         total_quantity = COALESCE($3, total_quantity),
         available_quantity = COALESCE($4, available_quantity),
         status = COALESCE($5, status)
     WHERE equipment_id = $6
     RETURNING *`,
    [name, category_id, total_quantity, available_quantity, status, id, isBulkParam]
  );

  if (result.rows.length === 0) throw new ApiError(404, 'Equipment not found');
  return result.rows[0];
}

async function deleteEquipment(user, id) {
  await assertOfficerOwnsEquipment(user, id);

  const result = await pool.query(
    'DELETE FROM equipment WHERE equipment_id = $1 RETURNING equipment_id',
    [id]
  );
  if (result.rows.length === 0) throw new ApiError(404, 'Equipment not found');
  return { message: 'Equipment deleted' };
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
