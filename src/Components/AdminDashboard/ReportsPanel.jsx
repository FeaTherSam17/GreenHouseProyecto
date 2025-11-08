import { useState } from 'react';
import './ReportsPanel.css';

const ReportsPanel = () => {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedVentaId, setSelectedVentaId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const fetchVentas = async () => {
    try {
      const response = await fetch(`http://localhost:3001/reportes/ventas_totales?start_date=${startDate}&end_date=${endDate}`);
      const data = await response.json();

      if (data.success) {
        setVentas(data.data.ventas.map(v => ({
          ...v,
          total_venta: Number(v.total_venta) || 0,
          fecha: v.fecha || ''
        })));
      } else {
        setError(data.error || 'Error al obtener ventas');
      }
    } catch (err) {
      console.error('Error al obtener las ventas:', err);
      setError('Hubo un error al obtener los datos');
    }
  };

  const fetchProductosVenta = async (idVenta) => {
    try {
      const res = await fetch(`http://localhost:3001/reportes/productos_venta/${idVenta}`);
      const data = await res.json();

      if (data.success) {
        setProductos(data.productos.map(p => ({
          ...p,
          precio_unitario: Number(p.precio_unitario) || 0,
          total: Number(p.total) || 0,
          cantidad: Number(p.cantidad) || 0
        })));
        setSelectedVentaId(idVenta);
      }
    } catch (err) {
      console.error(err);
      setError('Error al obtener productos vendidos');
    }
  };

  const handleCalculate = () => {
    if (!startDate || !endDate) {
      setError('Por favor, ingrese las fechas de inicio y fin');
      return;
    }
    // Validación de rango de fechas
    if (startDate > endDate) {
      setError('La fecha de inicio no puede ser mayor que la fecha de fin');
      return;
    }
    setError('');
    setProductos([]);
    setSelectedVentaId(null);
    fetchVentas();
  };

  const renderVentas = () => {
    return ventas.map((venta) => (
      <tr key={venta.id_venta}>
        <td>{venta.id_venta}</td>
        <td>{venta.fecha}</td>
        <td>${(Number(venta.total_venta) || 0).toFixed(2)}</td>
        <td>
          <button className="detalle-btn" onClick={() => fetchProductosVenta(venta.id_venta)}>
            Ver productos
          </button>
        </td>
      </tr>
    ));
  };

  const renderProductos = () => {
    if (productos.length === 0) return null;

    return (
      <div className="productos-vendidos">
        <h3>Productos vendidos en la venta #{selectedVentaId}</h3>
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p, idx) => (
              <tr key={idx}>
                <td>{p.nombre}</td>
                <td>{p.cantidad}</td>
                <td>${(Number(p.precio_unitario) || 0).toFixed(2)}</td>
                <td>${(Number(p.total) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="reports-wrapper">
      <h2>Reportes de Ventas</h2>
      <div className="date-filter">
        <div className="date-group">
          <label htmlFor="start-date">Fecha de inicio</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-group">
          <label htmlFor="end-date">Fecha de fin</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button onClick={handleCalculate}>Calcular</button>
      </div>

      {error && <p className="error">{error}</p>}

      {ventas.length > 0 && (
        <table className="tabla-ventas">
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>{renderVentas()}</tbody>
        </table>
      )}

      {renderProductos()}
    </div>
  );
};

export default ReportsPanel;
