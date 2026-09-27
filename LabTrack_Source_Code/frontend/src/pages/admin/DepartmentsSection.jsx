import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function DepartmentsSection() {
  const [departments, setDepartments] = useState([]);
  const [deptName, setDeptName] = useState('');
  const [editingDeptId, setEditingDeptId] = useState(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  function loadDepartments() {
    api.get('/departments').then((res) => setDepartments(res.data)).catch(() => {});
  }

  async function handleDepartmentSubmit(e) {
    e.preventDefault();
    if (!deptName) return;

    if (editingDeptId) {
      await api.put(`/departments/${editingDeptId}`, { name: deptName });
      setEditingDeptId(null);
    } else {
      await api.post('/departments', { name: deptName });
    }

    setDeptName('');
    loadDepartments();
  }

  async function deleteDepartment(id) {
    const confirmed = window.confirm('Are you sure you want to delete this department?');
    if (!confirmed) return;
    await api.delete(`/departments/${id}`);
    loadDepartments();
  }

  function startEditDepartment(d) {
    setEditingDeptId(d.department_id);
    setDeptName(d.name);
  }

  function cancelEditDepartment() {
    setEditingDeptId(null);
    setDeptName('');
  }

  return (
    <div className="card">
      <h3>Departments</h3>
      <form onSubmit={handleDepartmentSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Department name"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
        />
        {editingDeptId ? (
          <>
            <button className="secondary" type="submit">Save</button>
            <button type="button" onClick={cancelEditDepartment}>Cancel</button>
          </>
        ) : (
          <button className="primary" type="submit">Add</button>
        )}
      </form>

      {departments.map((d) => (
        <div key={d.department_id} style={{ marginBottom: 6 }}>
          {d.name}{' '}
          <button className="secondary" onClick={() => startEditDepartment(d)}>
            Edit
          </button>
          <button className="danger" onClick={() => deleteDepartment(d.department_id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
