import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Stock from './pages/Stock';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                   element={<Dashboard />} />
          <Route path="/proyectos"          element={<Proyectos />} />
          <Route path="/proyectos/:id"      element={<ProyectoDetalle />} />
          <Route path="/clientes"           element={<Clientes />} />
          <Route path="/stock"              element={<Stock />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
