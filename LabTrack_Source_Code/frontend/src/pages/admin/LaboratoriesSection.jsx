import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function LaboratoriesSection() {
  const [departments, setDepartments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [officers, setOfficers] = useState([]); // Technical Officers not yet assigned to a lab

  const [labName, setLabName] = useState('');
  const [labDept, setLabDept] = useState('');
  const [labOfficer, setLabOfficer] = useState('');
  const [labError, setLabError] = useState('');
  const [editingLabId, setEditingLabId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    api.get('/departments').then((res) => setDepartments(res.data)).catch(() => {});
    api.get('/laboratories').then((res) => setLabs(res.data)).catch(() => {});
    api
      .get('/laboratories/available-officers')
      .then((res) => setOfficers(res.data))
      .catch(() => {});
  }

  async function handleLabSubmit(e) {
    e.preventDefault();
    setLabError('');
    if (!labName || !labDept) return;

    try {
      if (editingLabId) {
        await api.put(`/laboratories/${editingLabId}`, {
          name: labName,
          department_id: labDept,
          technical_officer_id: labOfficer || null,
        });
        setEditingLabId(null);
      } else {
        await api.post('/laboratories', {
          name: labName,
          department_id: labDept,
          technical_officer_id: labOfficer || null,
        });
      }

      setLabName('');
      setLabDept('');
      setLabOfficer('');
      loadData();
    } catch (err) {
      setLabError(err.response?.data?.message || 'Failed to process laboratory');
    }
  }

  async function deleteLab(id) {
    const confirmed = window.confirm('Are you sure you want to delete this laboratory?');
    if (!confirmed) return;
    await api.delete(`/laboratories/${id}`);
    loadData();
  }

  function startEditLab(l) {
    setEditingLabId(l.lab_id);
    setLabName(l.name);
    setLabDept(l.department_id || '');
    setLabOfficer(l.technical_officer_id || '');
    setLabError('');
  }

  function cancelEditLab() {
    setEditingLabId(null);
    setLabName('');
    setLabDept('');
    setLabOfficer('');
    setLabError('');
  }

  let currentLabOfficerOptions = [...officers];
  if (editingLabId) {
    const lab = labs.find((l) => l.lab_id === editingLabId);
    if (lab && lab.technical_officer_id && !currentLabOfficerOptions.some((o) => o.user_id === lab.technical_officer_id)) {
      currentLabOfficerOptions.push({ user_id: lab.technical_officer_id, name: lab.technical_officer_name });
    }
  }

  return (
    <div className="card">
      <h3>Laboratories</h3>
      <form onSubmit={handleLabSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Lab name" value={labName} onChange={(e) => setLabName(e.target.value)} />
        <select value={labDept} onChange={(e) => setLabDept(e.target.value)}>
          <option value="">-- Department --</option>
          {departments.map((d) => (
            <option key={d.department_id} value={d.department_id}>
              {d.name}
            </option>
          ))}
        </select>
        <select value={labOfficer} onChange={(e) => setLabOfficer(e.target.value)}>
          <option value="">-- Technical Officer (optional) --</option>
          {currentLabOfficerOptions.map((o) => (
            <option key={o.user_id} value={o.user_id}>
              {o.name}
            </option>
          ))}
        </select>

        {editingLabId ? (
          <>
            <button className="secondary" type="submit">Save</button>
            <button type="button" onClick={cancelEditLab}>Cancel</button>
          </>
        ) : (
          <button className="primary" type="submit">Add</button>
        )}
      </form>

      {labError && <div className="error">{labError}</div>}

      {labs.map((l) => (
        <div key={l.lab_id} style={{ marginBottom: 10 }}>
          {l.name} ({l.department_name || 'No department'}) — Officer:{' '}
          {l.technical_officer_name || 'Unassigned'}{' '}
          <button className="secondary" onClick={() => startEditLab(l)}>
            Edit
          </button>
          <button className="danger" onClick={() => deleteLab(l.lab_id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
