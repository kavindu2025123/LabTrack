import { useEffect, useState } from 'react';
import api from '../api/axios';

const statusColors = {
  Pending: '#f59e0b',
  Approved: '#2563eb',
  Rejected: '#dc2626',
  Completed: '#16a34a',
};

// Helper function to correctly format date strings in local time
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [fines, setFines] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    api.get('/reservations').then((res) => setReservations(res.data)).catch(() => {});
    api.get('/payments/fines').then((res) => setFines(res.data)).catch(() => {});
  }

  async function payFine(fineId) {
    try {
      await api.post(`/payments/fines/${fineId}/pay`, { stripe_payment_id: 'test_' + Date.now() });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  }

  return (
    <div className="container">
      <h2>My Reservations</h2>
      {reservations.length === 0 && <p>No reservations yet.</p>}
      {reservations.map((r) => (
        <div className="card" key={r.reservation_id}>
          <div>
            <strong>{r.lab_name}</strong>{' '}
            <span className="status-tag" style={{ background: statusColors[r.status] }}>
              {r.status}
            </span>
          </div>
          <div>Date: {formatDate(r.reserved_date)}</div>
          <div>Time: {r.start_time} - {r.end_time}</div>
        </div>
      ))}

      <h2 style={{ marginTop: 32 }}>My Fines</h2>
      {fines.length === 0 && <p>No fines. Nice!</p>}
      {fines.map((f) => (
        <div className="card" key={f.fine_id}>
          <div>Amount: Rs. {f.amount}</div>
          <div>
            Status:{' '}
            <span className="status-tag" style={{ background: f.status === 'Paid' ? '#16a34a' : '#dc2626' }}>
              {f.status}
            </span>
          </div>
          {f.status === 'Unpaid' && (
            <button className="primary" style={{ marginTop: 8 }} onClick={() => payFine(f.fine_id)}>
              Pay with Stripe (Test)
            </button>
          )}
        </div>
      ))}
    </div>
  );
}