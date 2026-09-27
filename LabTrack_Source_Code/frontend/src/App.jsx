import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import EquipmentList from './pages/EquipmentList';
import MyReservations from './pages/MyReservations';
import OfficerReservations from './pages/OfficerReservations';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// This is the new Welcome Page when clicking "LabTrack"
function Home() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '60px' }}>
      <h1>Welcome to LabTrack!</h1>
      <h2>Hello, {user.name}</h2>
      <p style={{ fontSize: '1.2rem', marginTop: '16px' }}>
        You are logged in as: <strong>{user.role}</strong>
      </p>
      <p style={{ color: '#666', marginTop: '8px' }}>
        Please use the navigation bar above to access your tools.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <EquipmentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute roles={['Student']}>
              <MyReservations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/officer/reservations"
          element={
            <ProtectedRoute roles={['Technical_Officer', 'Admin']}>
              <OfficerReservations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}