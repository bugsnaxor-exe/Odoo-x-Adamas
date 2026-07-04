import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const employeeLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/attendance", label: "Attendance" },
  { to: "/leave", label: "Leave" },
  { to: "/payroll", label: "Payroll" },
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Employees" },
  { to: "/attendance", label: "Attendance" },
  { to: "/leave", label: "Leave Requests" },
  { to: "/payroll", label: "Payroll" },
];

export default function Sidebar({ open }) {
  const { isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <div className="sidebar__brand">HRMS</div>
      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
