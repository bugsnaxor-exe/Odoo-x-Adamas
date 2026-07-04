import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} />
      <div className="app-shell__main">
        <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
