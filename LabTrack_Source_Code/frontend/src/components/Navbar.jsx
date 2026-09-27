import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="navbar">
      <div>
        <Link to="/">LabTrack</Link>
        {user && (
          <>
            <Link to="/equipment">Equipment</Link>
            {user.role === 'Student' && <Link to="/my-reservations">My Reservations</Link>}
            {(user.role === 'Technical_Officer' || user.role === 'Admin') && (
              <Link to="/officer/reservations">Reservations</Link>
            )}
            {user.role === 'Admin' && <Link to="/admin">Admin</Link>}
          </>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ color: '#fff', marginRight: 12, fontSize: 14 }}>
              {user.name} ({user.role})
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
