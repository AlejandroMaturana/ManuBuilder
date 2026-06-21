import { NavLink, useLocation } from 'react-router-dom';

const NAV = [
  { to: '/',              icon: '📊', label: 'Dashboard'  },
  { to: '/proyectos',     icon: '🏗️', label: 'Proyectos'  },
  { to: '/cotizaciones',  icon: '📄', label: 'Cotizar'    },
  { to: '/clientes',      icon: '👥', label: 'Clientes'   },
  { to: '/stock',         icon: '📦', label: 'Stock'      },
  { to: '/configuracion', icon: '⚙️', label: 'Configuración'    },
];

const TITLES = {
  '/':              'Dashboard',
  '/proyectos':     'Proyectos',
  '/cotizaciones':  'Cotizaciones',
  '/clientes':      'Clientes',
  '/stock':         'Stock',
  '/configuracion': 'Configuración',
};

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const base = '/' + pathname.split('/')[1];
  const title = TITLES[base] ?? 'ManuBuilder';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>ManuBuilder</h1>
          <span>ERP Constructor</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ERP Constructor · MVP</p>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-spacer" />
        </header>
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
