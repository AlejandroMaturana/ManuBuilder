import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Stock from './pages/Stock';
import Configuracion from './pages/Configuracion';
import Cotizaciones from './pages/Cotizaciones';
import CotizacionForm from './pages/CotizacionForm';

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
          <Route path="/configuracion"      element={<Configuracion />} />
          <Route path="/cotizaciones"       element={<Cotizaciones />} />
          <Route path="/cotizaciones/nueva" element={<CotizacionForm />} />
          <Route path="/cotizaciones/:id"   element={<CotizacionForm />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
