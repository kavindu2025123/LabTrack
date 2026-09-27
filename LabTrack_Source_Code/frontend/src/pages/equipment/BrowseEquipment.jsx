import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function BrowseEquipment({ user }) {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');

  const [equipment, setEquipment] = useState([]);
  const [cart, setCart] = useState([]);
  const [reservedDate, setReservedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/departments').then((res) => setDepartments(res.data)).catch(() => {});
    api.get('/laboratories').then((res) => setLabs(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedLab('');
    setEquipment([]);
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedLab) {
      setEquipment([]);
      return;
    }
    api
      .get(`/equipment?lab_id=${selectedLab}`)
      .then((res) => setEquipment(res.data))
      .catch(() => {});
  }, [selectedLab]);

  function addToCart(item) {
    if (item.status === 'Unavailable' || item.available_quantity < 1) return;
    if (cart.find((c) => c.equipment_id === item.equipment_id)) return;

    setCart([
      ...cart,
      {
        equipment_id: item.equipment_id,
        name: item.name,
        quantity_requested: 1,
        is_bulk: item.is_bulk,
        available_quantity: item.available_quantity,
      },
    ]);
  }

  function removeFromCart(equipment_id) {
    setCart(cart.filter((c) => c.equipment_id !== equipment_id));
  }

  function updateQty(equipment_id, qty) {
    setCart(
      cart.map((c) =>
        c.equipment_id === equipment_id ? { ...c, quantity_requested: Number(qty) } : c
      )
    );
  }

  async function submitReservation() {
    setMessage('');
    if (!selectedLab || !reservedDate || !startTime || !endTime || cart.length === 0) {
      setMessage('Please select a lab, date, time and at least one item.');
      return;
    }
    try {
      await api.post('/reservations', {
        lab_id: selectedLab,
        reserved_date: reservedDate,
        start_time: startTime,
        end_time: endTime,
        items: cart.map(({ equipment_id, quantity_requested }) => ({
          equipment_id,
          quantity_requested,
        })),
      });
      setMessage('Reservation submitted! Check "My Reservations" for status.');
      setCart([]);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit reservation');
    }
  }

  const filteredLabs = selectedDept
    ? labs.filter((lab) => String(lab.department_id) === String(selectedDept))
    : [];

  return (
    <div className="container">
      <h2>Browse Equipment</h2>

      {/* --- Step 1: Select Department --- */}
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Select Department</label>
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
          <option value="">-- Choose a department --</option>
          {departments.map((dept) => (
            <option key={dept.department_id} value={dept.department_id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- Step 2: Select Laboratory --- */}
      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label>Select Laboratory</label>
        <select
          value={selectedLab}
          onChange={(e) => setSelectedLab(e.target.value)}
          disabled={!selectedDept}
        >
          <option value="">-- Choose a lab --</option>
          {filteredLabs.map((lab) => (
            <option key={lab.lab_id} value={lab.lab_id}>
              {lab.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- Equipment Cards --- */}
      {equipment.length === 0 && selectedLab && (
        <p>No equipment found in this laboratory.</p>
      )}

      {equipment.map((item) => (
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

          <div>Available: {item.available_quantity} / {item.total_quantity}</div>
          <div>Status: {item.status}</div>

          {user?.role === 'Student' && (
            <button
              className="secondary"
              style={{ marginTop: 8 }}
              onClick={() => addToCart(item)}
              disabled={item.status === 'Unavailable' || item.available_quantity < 1}
            >
              {item.status === 'Unavailable' ? 'Unavailable' : 'Add to Cart'}
            </button>
          )}
        </div>
      ))}

      {/* --- Reservation Cart for Students --- */}
      {user?.role === 'Student' && cart.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>Cart</h3>
          {cart.map((c) => (
            <div key={c.equipment_id} style={{ marginBottom: 8 }}>
              {c.name} {c.is_bulk && <span className="status-tag" style={{ background: '#7c3aed', color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>Bulk</span>} — Qty:{' '}
              <input
                type="number"
                min="1"
                max={c.is_bulk ? c.available_quantity : 1}
                value={c.quantity_requested}
                onChange={(e) => updateQty(c.equipment_id, e.target.value)}
                disabled={!c.is_bulk}
                style={{ width: 60 }}
                title={!c.is_bulk ? 'Not a bulk item — only 1 unit can be requested' : ''}
              />
              <button className="danger" style={{ marginLeft: 8 }} onClick={() => removeFromCart(c.equipment_id)}>
                Remove
              </button>
            </div>
          ))}

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Reservation Date</label>
            <input type="date" value={reservedDate} onChange={(e) => setReservedDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          {message && <div className="error">{message}</div>}
          <button className="primary" onClick={submitReservation} style={{ marginTop: '16px' }}>
            Submit Reservation
          </button>
        </div>
      )}
    </div>
  );
}
