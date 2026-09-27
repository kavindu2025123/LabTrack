import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function TechnicalOfficerEquipment() {
  const [myLab, setMyLab] = useState(null);
  const [labError, setLabError] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);

  // --- Equipment form state ---
  const [equipName, setEquipName] = useState('');
  const [equipCategory, setEquipCategory] = useState('');
  const [equipTotalQty, setEquipTotalQty] = useState(1);
  const [equipIsBulk, setEquipIsBulk] = useState(false);
  const [equipError, setEquipError] = useState('');
  const [editingEquipId, setEditingEquipId] = useState(null);

  // --- Category form state ---
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  useEffect(() => {
    loadLab();
    loadCategories();
  }, []);

  function loadLab() {
    api
      .get('/laboratories/my-lab')
      .then((res) => {
        setMyLab(res.data);
        loadEquipmentAndMaintenance(res.data.lab_id);
      })
      .catch((err) => {
        setLabError(err.response?.data?.message || 'Could not load your laboratory');
      });
  }

  function loadEquipmentAndMaintenance(labId) {
    api.get(`/equipment?lab_id=${labId}`).then((res) => setEquipment(res.data)).catch(() => {});
    api.get(`/maintenance?lab_id=${labId}&status=Open`).then((res) => setMaintenanceTickets(res.data)).catch(() => {});
  }

  function loadCategories() {
    api.get('/equipment/categories').then((res) => setCategories(res.data)).catch(() => {});
  }

  // ==================== EQUIPMENT ====================

  async function handleEquipmentSubmit(e) {
    e.preventDefault();
    setEquipError('');
    if (!equipName) return;

    try {
      if (editingEquipId) {
        await api.put(`/equipment/${editingEquipId}`, {
          name: equipName,
          category_id: equipCategory || null,
          total_quantity: Number(equipTotalQty),
          is_bulk: equipIsBulk,
        });
        setEditingEquipId(null);
      } else {
        await api.post('/equipment', {
          name: equipName,
          category_id: equipCategory || null,
          total_quantity: Number(equipTotalQty) || 1,
          is_bulk: equipIsBulk,
        });
      }

      setEquipName('');
      setEquipCategory('');
      setEquipTotalQty(1);
      setEquipIsBulk(false);
      loadEquipmentAndMaintenance(myLab.lab_id);
    } catch (err) {
      setEquipError(err.response?.data?.message || 'Failed to process equipment');
    }
  }

  async function deleteEquipment(id) {
    const confirmed = window.confirm('Are you sure you want to delete this equipment?');
    if (!confirmed) return;
    try {
      await api.delete(`/equipment/${id}`);
      loadEquipmentAndMaintenance(myLab.lab_id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete equipment');
    }
  }

  function startEditEquipment(item) {
    setEditingEquipId(item.equipment_id);
    setEquipName(item.name);
    setEquipCategory(item.category_id || '');
    setEquipTotalQty(item.total_quantity);
    setEquipIsBulk(item.is_bulk);
    setEquipError('');
  }

  function cancelEditEquipment() {
    setEditingEquipId(null);
    setEquipName('');
    setEquipCategory('');
    setEquipTotalQty(1);
    setEquipIsBulk(false);
    setEquipError('');
  }

  // ==================== MAINTENANCE ====================

  async function reportMaintenance(item) {
    const description = window.prompt(`Describe the issue with "${item.name}":`);
    if (!description) return;
    try {
      await api.post('/maintenance', { equipment_id: item.equipment_id, description });
      loadEquipmentAndMaintenance(myLab.lab_id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to report maintenance');
    }
  }

  async function resolveTicket(ticketId) {
    try {
      await api.put(`/maintenance/${ticketId}/resolve`);
      loadEquipmentAndMaintenance(myLab.lab_id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve maintenance ticket');
    }
  }

  // ==================== CATEGORIES ====================

  async function handleCategorySubmit(e) {
    e.preventDefault();
    setCategoryError('');
    if (!categoryName) return;

    try {
      if (editingCategoryId) {
        await api.put(`/equipment/categories/${editingCategoryId}`, { name: categoryName });
        setEditingCategoryId(null);
      } else {
        await api.post('/equipment/categories', { name: categoryName });
      }

      setCategoryName('');
      loadCategories();
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Failed to process category');
    }
  }

  async function deleteCategory(id) {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (!confirmed) return;
    await api.delete(`/equipment/categories/${id}`);
    loadCategories();
  }

  function startEditCategory(c) {
    setEditingCategoryId(c.category_id);
    setCategoryName(c.name);
    setCategoryError('');
  }

  function cancelEditCategory() {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryError('');
  }

  if (labError) {
    return (
      <div className="container">
        <h2>Equipment Management</h2>
        <div className="error">{labError}</div>
        <p style={{ fontSize: 14 }}>
          Ask an Admin to assign you to a laboratory before you can manage equipment.
        </p>
      </div>
    );
  }

  if (!myLab) {
    return (
      <div className="container">
        <p>Loading your laboratory...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Equipment Management</h2>
      <p style={{ marginTop: -8, color: '#555' }}>
        Laboratory: <strong>{myLab.name}</strong> ({myLab.department_name || 'No department'})
      </p>

      {/* ==================== EQUIPMENT CATEGORIES ==================== */}
      <div className="card">
        <h3>Equipment Categories</h3>
        <form onSubmit={handleCategorySubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            placeholder="Category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          {editingCategoryId ? (
            <>
              <button className="secondary" type="submit">Save</button>
              <button type="button" onClick={cancelEditCategory}>Cancel</button>
            </>
          ) : (
            <button className="primary" type="submit">Add Category</button>
          )}
        </form>
        {categoryError && <div className="error">{categoryError}</div>}

        {categories.length === 0 && <p>No categories yet.</p>}
        {categories.map((c) => (
          <div key={c.category_id} style={{ marginBottom: 6 }}>
            {c.name}{' '}
            <button className="secondary" onClick={() => startEditCategory(c)}>
              Edit
            </button>
            <button className="danger" onClick={() => deleteCategory(c.category_id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ==================== EQUIPMENT ==================== */}
      <div className="card">
        <h3>Equipment in {myLab.name}</h3>
        <form onSubmit={handleEquipmentSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="Equipment name"
            value={equipName}
            onChange={(e) => setEquipName(e.target.value)}
          />
          <select value={equipCategory} onChange={(e) => setEquipCategory(e.target.value)}>
            <option value="">-- Category (optional) --</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            placeholder="Total qty"
            value={equipTotalQty}
            onChange={(e) => setEquipTotalQty(e.target.value)}
            style={{ width: 90 }}
          />

          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="checkbox"
              checked={equipIsBulk}
              onChange={(e) => setEquipIsBulk(e.target.checked)}
            />
            Bulk item
          </label>

          {editingEquipId ? (
            <>
              <button className="secondary" type="submit">Save</button>
              <button type="button" onClick={cancelEditEquipment}>Cancel</button>
            </>
          ) : (
            <button className="primary" type="submit">Add Equipment</button>
          )}
        </form>
        {equipError && <div className="error">{equipError}</div>}

        {equipment.length === 0 && <p>No equipment added yet.</p>}
        {equipment.map((item) => {
          const itemTickets = maintenanceTickets.filter(
            (t) => String(t.equipment_id) === String(item.equipment_id)
          );

          return (
            <div className="card" key={item.equipment_id}>
              <strong>{item.name}</strong> — {item.category_name || 'Uncategorized'}
              {item.is_bulk && (
                <span className="status-tag" style={{ background: '#7c3aed', color: '#fff', marginLeft: 8, padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                  Bulk
                </span>
              )}
              {item.status === 'Unavailable' && (
                <span className="status-tag" style={{ background: '#dc2626', color: '#fff', marginLeft: 8, padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                  Unavailable
                </span>
              )}

              <div style={{ marginTop: 4 }}>
                Total: {item.total_quantity} &nbsp;|&nbsp;
                Available: {item.available_quantity} &nbsp;|&nbsp;
                Reserved: {item.reserved_qty} &nbsp;|&nbsp;
                Issued: {item.issued_qty} &nbsp;|&nbsp;
                Maintenance: {item.maintenance_qty}
              </div>
              <div>Status: {item.status}</div>

              <div style={{ marginTop: 8 }}>
                <button className="secondary" onClick={() => startEditEquipment(item)}>
                  Edit
                </button>
                <button className="danger" onClick={() => deleteEquipment(item.equipment_id)}>
                  Delete
                </button>
                <button
                  onClick={() => reportMaintenance(item)}
                  disabled={item.available_quantity < 1}
                  style={{ marginLeft: 6 }}
                  title={item.available_quantity < 1 ? 'No available units to pull for repair' : ''}
                >
                  Report Maintenance
                </button>
              </div>

              {/* LIST OF INDIVIDUAL MAINTENANCE TICKETS WITH DESCRIPTIONS */}
              {itemTickets.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 14px',
                    background: '#fff1f0',
                    border: '1px solid #ffa39e',
                    borderRadius: 6,
                  }}
                >
                  <strong style={{ color: '#cf1322', fontSize: 13 }}>
                    Units in Maintenance ({itemTickets.length}):
                  </strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: 20, fontSize: 13 }}>
                    {itemTickets.map((ticket) => (
                      <li key={ticket.ticket_id} style={{ marginBottom: 6 }}>
                        <span>
                          <strong>#{ticket.ticket_id}</strong> — {ticket.description || 'No description provided'}
                        </span>
                        <button
                          className="secondary"
                          style={{ marginLeft: 12, padding: '2px 8px', fontSize: 12 }}
                          onClick={() => resolveTicket(ticket.ticket_id)}
                        >
                          Resolve
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}