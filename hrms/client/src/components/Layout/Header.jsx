import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="header">
      <button className="header__menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
        ☰
      </button>
      <div className="header__spacer" />
      <div className="header__user">
        <span className="header__badge">{user?.role}</span>
        <span className="header__email">{user?.email}</span>
        <button className="btn btn--ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
