import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AlmacenistaPanel.css';
import logo from '../Login/assets/logo.png';

const AlmacenistaPanel = () => {
  const navigate = useNavigate();

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: 'plantas',
    precio: '',
    proveedor: '',
    cantidad: ''
  });

  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null); // id del producto que se edita

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productosResp, proveedoresResp] = await Promise.all([
          fetch('http://localhost:3001/productos'),
          fetch('http://localhost:3001/suppliers')
        ]);

        if (!productosResp.ok || !proveedoresResp.ok) {
          throw new Error('Error al obtener productos o proveedores');
        }

        const productosData = await productosResp.json();
        const proveedoresData = await proveedoresResp.json();

        if (!productosData || !proveedoresData) {
          throw new Error('Datos de respuesta no válidos');
        }

        const listaProveedores = proveedoresData.suppliers || [];

        // CORREGIDO: Accede a productosData.productos
        const listaProductos = Array.isArray(productosData.productos)
          ? productosData.productos
          : [];

        setProveedores(listaProveedores.map(p => ({
          ...p,
          id: p.id || p.id_proveedor
        })));

        setProductos(listaProductos.map(p => ({
          id: p.id || p.id_producto,
          nombre: p.nombre,
          categoria: (p.categoria || 'plantas').toLowerCase(),
          precio: parseFloat(p.precio) || 0,
          stock: p.stock || 0,
          proveedor: p.proveedor || 'Sin proveedor'
        })));
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: value }));
  };

  const obtenerIdCategoria = (categoria) => {
    switch (categoria.toLowerCase()) {
      case 'plantas': return 1;
      case 'herramientas': return 2;
      default: return null;
    }
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      alert('Nombre y precio son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const method = editando ? 'PUT' : 'POST';
      const url = editando
        ? `http://localhost:3001/productos/${editando}`
        : 'http://localhost:3001/productos';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoProducto.nombre,
          id_categoria: obtenerIdCategoria(nuevoProducto.categoria),
          precio: parseFloat(nuevoProducto.precio),
          stock: parseInt(nuevoProducto.cantidad || 0),
          id_proveedor: nuevoProducto.proveedor || null
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al guardar producto');

      const proveedorNombre = proveedores.find(p => p.id == nuevoProducto.proveedor)?.nombre || 'Sin proveedor';

      if (editando) {
        // Actualizar producto editado en estado
        setProductos(prev =>
          prev.map(p =>
            p.id === editando
              ? {
                  ...p,
                  nombre: nuevoProducto.nombre,
                  categoria: nuevoProducto.categoria,
                  precio: parseFloat(nuevoProducto.precio),
                  stock: parseInt(nuevoProducto.cantidad),
                  proveedor: proveedorNombre
                }
              : p
          )
        );
        setEditando(null);
      } else {
        // Agregar nuevo producto
        setProductos(prev => [...prev, {
          id: data.id,
          nombre: nuevoProducto.nombre,
          categoria: nuevoProducto.categoria,
          precio: parseFloat(nuevoProducto.precio),
          stock: parseInt(nuevoProducto.cantidad || 0),
          proveedor: proveedorNombre
        }]);
      }

      setNuevoProducto({
        nombre: '',
        categoria: 'plantas',
        precio: '',
        proveedor: '',
        cantidad: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const editarProducto = (producto) => {
    setNuevoProducto({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      proveedor: proveedores.find(p => p.nombre === producto.proveedor)?.id || '',
      cantidad: producto.stock
    });
    setEditando(producto.id);
  };

  const productosFiltrados = productos.filter(p => {
    const nombreCoincide = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const categoriaCoincide = categoriaFiltro === 'todas' || p.categoria === categoriaFiltro;
    return nombreCoincide && categoriaCoincide;
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Agrupar productos por nombre y sumar cantidades (esto va antes del return)
  const productosGenerales = Object.values(
    productos.reduce((acc, prod) => {
      const nombre = prod.nombre.trim().toLowerCase();
      if (!acc[nombre]) {
        acc[nombre] = {
          nombre: prod.nombre,
          cantidad: prod.stock
        };
      } else {
        acc[nombre].cantidad += prod.stock;
      }
      return acc;
    }, {})
  );

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="almacenista-panel">
      <button className="floating-logout-btn" onClick={handleLogout} title="Cerrar sesión">
        <span className="logout-icon">⎋</span>
      </button>

      <header className="panel-header">
        <img src={logo} alt="GreenHouse Logo" className="panel-logo" />
        <h1>GreenHouse - Gestión de Inventario</h1>
      </header>

      <div className="panel-container">
        <div className="formulario-section">
          <h2>{editando ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h2>

          <form onSubmit={agregarProducto} className="producto-form">
            <div className="form-group">
              <label>Nombre*:</label>
              <input
                type="text"
                name="nombre"
                value={nuevoProducto.nombre}
                onChange={handleInputChange}
                required
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label>Categoría:</label>
              <select name="categoria" value={nuevoProducto.categoria} onChange={handleInputChange}>
                <option value="plantas">Plantas</option>
                <option value="herramientas">Herramientas</option>
              </select>
            </div>

            <div className="form-group">
              <label>Precio*:</label>
              <input
                type="number"
                name="precio"
                value={nuevoProducto.precio}
                onChange={handleInputChange}
                min="0.01"
                max="9999"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Cantidad:</label>
              <input
                type="number"
                name="cantidad"
                value={nuevoProducto.cantidad}
                onChange={handleInputChange}
                min="1"
                max="9999"
                step="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Proveedor:</label>
              <select name="proveedor" value={nuevoProducto.proveedor} onChange={handleInputChange}>
                <option value="">Seleccione proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="guardar-btn" disabled={loading}>
              {loading ? 'Guardando...' : (editando ? 'Guardar Cambios' : 'Registrar Producto')}
            </button>

            {editando && (
              <button type="button" onClick={() => {
                setNuevoProducto({
                  nombre: '',
                  categoria: 'plantas',
                  precio: '',
                  proveedor: '',
                  cantidad: ''
                });
                setEditando(null);
              }} className="cancelar-btn">
                Cancelar Edición
              </button>
            )}
          </form>
        </div>

        <div className="lista-section">
          <h2>Inventario de Productos</h2>

          <div className="filtros">
            <input type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="busqueda-input" />
            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="categoria-select">
              <option value="todas">Todas las categorías</option>
              <option value="plantas">Plantas</option>
              <option value="herramientas">Herramientas</option>
            </select>
          </div>

          <div className="productos-table-container">
            <table className="productos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Proveedor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr><td colSpan="7" className="no-resultados">No se encontraron productos</td></tr>
                ) : (
                  productosFiltrados.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nombre}</td>
                      <td className={`categoria-${p.categoria}`}>
                        {p.categoria === 'plantas' ? '🌱 Plantas' : '🛠️ Herramientas'}
                      </td>
                      <td>${p.precio.toFixed(2)}</td>
                      <td>{p.stock}</td>
                      <td>{p.proveedor}</td>
                      <td>
                        <div className="acciones-btns">
                          <button onClick={() => editarProducto(p)} className="editar-btn">
                            ✏️ Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
                                setLoading(true);
                                try {
                                  const response = await fetch(`http://localhost:3001/productos/${p.id}`, { method: 'DELETE' });
                                  if (!response.ok) throw new Error('Error al eliminar producto');
                                  setProductos(prev => prev.filter(prod => prod.id !== p.id));
                                } catch (err) {
                                  setError(err.message);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                            className="eliminar-btn"
                            disabled={loading}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tabla general de productos agrupados por nombre */}
          <div className="productos-table-container">
            <h3>Resumen General de Productos</h3>
            <table className="productos-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad Total</th>
                </tr>
              </thead>
              <tbody>
                {productosGenerales.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="no-resultados">No hay productos</td>
                  </tr>
                ) : (
                  productosGenerales.map((prod, idx) => (
                    <tr key={idx}>
                      <td>{prod.nombre}</td>
                      <td>{prod.cantidad}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="resumen-inventario">
            <div className="resumen-item">
              <span>Total productos:</span>
              <span>{productos.length}</span>
            </div>
            <div className="resumen-item">
              <span>Plantas:</span>
              <span>{productos.filter(p => p.categoria === 'plantas').length}</span>
            </div>
            <div className="resumen-item">
              <span>Herramientas:</span>
              <span>{productos.filter(p => p.categoria === 'herramientas').length}</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="panel-footer">
        <img src={logo} alt="GreenHouse Logo" className="footer-logo" />
        <p>© {new Date().getFullYear()} GreenHouse</p>
      </footer>
    </div>
  );
};

export default AlmacenistaPanel;
