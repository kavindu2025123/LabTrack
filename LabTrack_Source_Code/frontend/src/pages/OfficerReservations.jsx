import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Formats a timestamp as e.g. "9/25/2026, 17:10:15" so it matches the
// 24-hour HH:MM:SS style already used for the reservation's Date/Time line.
function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', { hour12: false });
}

export default function OfficerReservations() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    loadReservations();
  }, []);

  function loadReservations() {
    api
      .get('/reservations')
      .then((res) => setReservations(res.data))
      .catch(() => {});
  }

  async function approve(id) {
    await api.put(`/reservations/${id}/approve`);
    loadReservations();
  }

  async function reject(id) {
    await api.put(`/reservations/${id}/reject`);
    loadReservations();
  }

  async function issue(id) {
    try {
      await api.post('/borrowing/issue', { reservation_id: id });
      loadReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue equipment');
    }
  }

  async function handleReturn(recordId) {
    const confirmed = window.confirm('Confirm returning this equipment?');
    if (!confirmed) return;

    try {
      const res = await api.put(`/borrowing/${recordId}/return`);

      if (res.data.fineAmount > 0) {
        alert(
          `Equipment returned!\n\nOverdue Fine Issued: Rs. ${res.data.fineAmount} (${res.data.daysLate} day(s) late)`
        );
      } else {
        alert('Equipment returned successfully! No fine incurred.');
      }

      loadReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process return');
    }
  }

  return (
    <div className="container">
      <h2>{isAdmin ? 'Reservations Monitor' : 'Reservations'}</h2>
      {reservations.length === 0 && <p>No reservations found.</p>}

      {reservations.map((r) => (
        <div className="card" key={r.reservation_id} style={{ marginBottom: 12 }}>
          <div>
            <strong>{r.student_name}</strong> — {r.lab_name}
          </div>
          <div>
            Date: {r.reserved_date?.slice(0, 10)} | Time: {r.start_time} - {r.end_time}
          </div>
          <div>Status: {r.status}</div>

          {/* DISPLAY BORROWING & RETURN DATA IF ISSUED */}
          {r.record_id && (
            <div
              style={{
                marginTop: 8,
                padding: '8px 12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              <div>
                <strong>Issued At:</strong> {formatDateTime(r.issued_at)}
              </div>
              <div>
                <strong>Returned At:</strong>{' '}
                {r.returned_at ? (
                  <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                    {formatDateTime(r.returned_at)}
                  </span>
                ) : (
                  <span style={{ color: '#d97706', fontWeight: 'bold' }}>Not Returned Yet</span>
                )}
              </div>
              {r.fine_amount > 0 && (
                <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: 4 }}>
                  Fine Incurred: Rs. {r.fine_amount} ({r.fine_status || 'Unpaid'})
                </div>
              )}
            </div>
          )}

          {/* ACTION BUTTONS: Admin only monitors, so no action buttons for Admin */}
          {!isAdmin && (
            <div style={{ marginTop: 8 }}>
              {r.status === 'Pending' && (
                <>
                  <button className="secondary" onClick={() => approve(r.reservation_id)}>
                    Approve
                  </button>
                  <button
                    className="danger"
                    style={{ marginLeft: 6 }}
                    onClick={() => reject(r.reservation_id)}
                  >
                    Reject
                  </button>
                </>
              )}

              {r.status === 'Approved' && (
                <button className="primary" onClick={() => issue(r.reservation_id)}>
                  Issue Equipment
                </button>
              )}

              {/* RETURN BUTTON: Shown when issued but not yet returned */}
              {r.record_id && !r.returned_at && (
                <button
                  className="primary"
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => handleReturn(r.record_id)}
                >
                  Mark as Returned
                </button>
              )}

              {r.returned_at && (
                <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: 13 }}>
                  ✓ Item Returned
                </span>
              )}
            </div>
          )}

          {/* ADMIN VIEW: Read-only status badge, no actions */}
          {isAdmin && (
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 'bold',
                  background:
                    r.status === 'Pending'
                      ? '#fef3c7'
                      : r.status === 'Approved'
                      ? '#dbeafe'
                      : r.status === 'Rejected'
                      ? '#fee2e2'
                      : '#f1f5f9',
                  color:
                    r.status === 'Pending'
                      ? '#92400e'
                      : r.status === 'Approved'
                      ? '#1e40af'
                      : r.status === 'Rejected'
                      ? '#991b1b'
                      : '#334155',
                }}
              >
                {r.status}
              </span>
              {r.record_id && !r.returned_at && (
                <span style={{ marginLeft: 8, color: '#d97706', fontWeight: 'bold', fontSize: 13 }}>
                  ● Currently Issued
                </span>
              )}
              {r.returned_at && (
                <span style={{ marginLeft: 8, color: '#16a34a', fontWeight: 'bold', fontSize: 13 }}>
                  ✓ Item Returned
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}