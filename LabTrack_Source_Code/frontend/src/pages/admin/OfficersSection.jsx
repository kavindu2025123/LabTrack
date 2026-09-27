import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function OfficersSection() {
  const [allOfficers, setAllOfficers] = useState([]); // every Technical Officer account

  const [officerName, setOfficerName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [officerError, setOfficerError] = useState('');
  const [editingOfficerId, setEditingOfficerId] = useState(null);

  useEffect(() => {
    loadOfficers();
  }, []);

  function loadOfficers() {
    api
      .get('/users')
      .then((res) => setAllOfficers(res.data.filter((u) => u.role === 'Technical_Officer')))
      .catch(() => {});
  }

  async function handleOfficerSubmit(e) {
    e.preventDefault();
    setOfficerError('');
    if (!officerName || !officerEmail) return;

    try {
      if (editingOfficerId) {
        const payload = { name: officerName, email: officerEmail };
        if (officerPassword) payload.password = officerPassword;

        await api.put(`/users/${editingOfficerId}`, payload);
        setEditingOfficerId(null);
      } else {
        if (!officerPassword) return;
        await api.post('/users', {
          name: officerName,
          email: officerEmail,
          password: officerPassword,
          role: 'Technical_Officer',
        });
      }

      setOfficerName('');
      setOfficerEmail('');
      setOfficerPassword('');
      loadOfficers();
    } catch (err) {
      setOfficerError(err.response?.data?.message || 'Failed to process Technical Officer');
    }
  }

  async function deleteOfficer(id) {
    const confirmed = window.confirm('Are you sure you want to delete this Technical Officer?');
    if (!confirmed) return;
    try {
      await api.delete(`/users/${id}`);
      loadOfficers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete Technical Officer');
    }
  }

  function startEditOfficer(o) {
    setEditingOfficerId(o.user_id);
    setOfficerName(o.name);
    setOfficerEmail(o.email);
    setOfficerPassword('');
    setOfficerError('');
  }

  function cancelEditOfficer() {
    setEditingOfficerId(null);
    setOfficerName('');
    setOfficerEmail('');
    setOfficerPassword('');
    setOfficerError('');
  }

  return (
    <div className="card">
      <h3>Technical Officers</h3>
      <form onSubmit={handleOfficerSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Full name"
          value={officerName}
          onChange={(e) => setOfficerName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={officerEmail}
          onChange={(e) => setOfficerEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder={editingOfficerId ? "New password (optional)" : "Temporary password"}
          value={officerPassword}
          onChange={(e) => setOfficerPassword(e.target.value)}
        />

        {editingOfficerId ? (
          <>
            <button className="secondary" type="submit">Save</button>
            <button type="button" onClick={cancelEditOfficer}>Cancel</button>
          </>
        ) : (
          <button className="primary" type="submit">Create Officer</button>
        )}
      </form>

      {officerError && <div className="error">{officerError}</div>}

      {allOfficers.map((o) => (
        <div key={o.user_id} style={{ marginBottom: 6 }}>
          {o.name} ({o.email}){' '}
          <button className="secondary" onClick={() => startEditOfficer(o)}>
            Edit
          </button>
          <button className="danger" onClick={() => deleteOfficer(o.user_id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
