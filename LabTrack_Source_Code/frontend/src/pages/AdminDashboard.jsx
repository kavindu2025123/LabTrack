import DepartmentsSection from './admin/DepartmentsSection';
import OfficersSection from './admin/OfficersSection';
import LaboratoriesSection from './admin/LaboratoriesSection';

export default function AdminDashboard() {
  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <DepartmentsSection />
      <OfficersSection />
      <LaboratoriesSection />
    </div>
  );
}
