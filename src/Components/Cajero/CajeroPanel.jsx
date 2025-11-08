import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CajeroPanel.css';
import logo from '../Login/assets/logo.png';

// --- Componente ModalPago (Calculadora de Cambio) ---
const ModalPago = ({ isOpen, onClose, totalAPagar, onConfirm }) => {
  const [dineroRecibido, setDineroRecibido] = useState('');
  const [cambio, setCambio] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleRecibidoChange = (e) => {
    const recibidoStr = e.target.value;
    setDineroRecibido(recibidoStr); 

    const recibido = parseFloat(recibidoStr) || 0;

    if (recibidoStr === '' || recibido === 0) {
      setError('');
      setCambio(0);
    } else if (recibido < totalAPagar) {
      setError('El dinero recibido es insuficiente');
      setCambio(0);
    } else {
      setError('');
      setCambio((recibido - totalAPagar).toFixed(2));
    }
  };

  const handleConfirmar = async () => { 
    const recibido = parseFloat(dineroRecibido) || 0;
    if (recibido < totalAPagar && totalAPagar > 0) {
      setError('El dinero recibido es insuficiente');
      return;
    }
    
    setLoading(true);
    setError(''); 

    try {
      const result = await onConfirm(); 

      if (result.success === true) {
        handleClose(); 
      } else {
        setError(result.message); 
      }
    } catch (err) {
      setError('Error inesperado al confirmar el pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDineroRecibido('');
    setCambio(0);
    setError('');
    setLoading(false);
    onClose(); 
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={handleClose} style={{position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
        <h2>Procesar Pago</h2>
        
        <div className="resumen-linea total" style={{fontSize: '1.5rem', marginBottom: '20px'}}>
          <span>Total a Pagar:</span>
          <span>${totalAPagar.toFixed(2)}</span>
        </div>

        <div className="input-group" style={{marginBottom: '10px'}}>
          <label htmlFor="dineroRecibido" style={{display: 'block', marginBottom: '5px'}}>Dinero Recibido:</label>
          <input
            id="dineroRecibido"
            type="number"
            value={dineroRecibido}
            onChange={handleRecibidoChange}
            placeholder="Ingrese el monto..."
            style={{ width: '100%', padding: '10px', fontSize: '1.2rem', boxSizing: 'border-box' }}
            autoFocus
            disabled={loading}
          />
        </div>

        {error && <p className="error-message" style={{color: 'red', margin: '10px 0 0 0', fontWeight: 'bold'}}>{error}</p>}

        {cambio > 0 && !error && (
          <h3 style={{ color: 'green', marginTop: '15px' }}>
            Cambio a devolver: ${cambio}
          </h3>
        )}

        <div className="acciones-venta" style={{marginTop: '20px'}}>
          <button className="cancelar-btn" onClick={handleClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="finalizar-btn"
            onClick={handleConfirmar}
            disabled={loading || (parseFloat(dineroRecibido) < totalAPagar && totalAPagar > 0) || !!error}
          >
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- Fin Componente ModalPago ---


// --- Componente Principal CajeroPanel ---
const CajeroPanel = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ventaActual, setVentaActual] = useState({
    items: [],
    subtotal: 0,
    descuento: 0,
    total: 0
  });
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(''); 

  const navigate = useNavigate();

  useEffect(() => {
    const verificarAutenticacion = () => {
      const usuario = JSON.parse(localStorage.getItem('user'));
      const idUsuario = localStorage.getItem('id_usuario');
      
      if (!usuario || !idUsuario || usuario.role !== 3) {
        localStorage.removeItem('user');
        localStorage.removeItem('id_usuario');
        navigate('/');
        return false;
      }
      return true;
    };

    if (!verificarAutenticacion()) return;

    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(''); 
        setErrorGlobal('');
        
        // --- AQUÍ ESTÁ LA CORRECCIÓN ---
        // Volví a poner los headers de Authorization
        const productosResponse = await fetch('http://localhost:3001/productos', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        
        const categoriasResponse = await fetch('http://localhost:3001/categorias', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        // --- FIN DE LA CORRECCIÓN ---

        if (!productosResponse.ok || !categoriasResponse.ok) {
          // Si el token es inválido, el backend debería responder 401
          if (productosResponse.status === 401 || categoriasResponse.status === 401) {
            handleLogout(); // Desloguea al usuario
            throw new Error('Sesión inválida o expirada');
          }
          throw new Error('Error al cargar datos');
        }

        const productosData = await productosResponse.json();
        const categoriasData = await categoriasResponse.json();

        if (productosData.success && Array.isArray(productosData.productos)) {
          setProductos(productosData.productos.map(p => ({
            ...p,
            precio: Number(p.precio) || 0,
            stock: Number(p.stock) || 0
          })));
        } else {
          console.warn("Respuesta de productos no esperada:", productosData);
          setProductos([]);
        }

        if (categoriasData.success && Array.isArray(categoriasData.categorias)) {
          setCategorias(categoriasData.categorias);
        } else {
          console.warn("Respuesta de categorías no esperada:", categoriasData);
          setCategorias([]);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();

    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);


  const agregarProducto = (producto) => {
    const itemExistente = ventaActual.items.find(item => item.id_producto === producto.id_producto);

    if (producto.stock <= 0) {
      alert("Producto fuera de stock");
      return;
    }

    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        const itemsActualizados = ventaActual.items.map(item =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1, total: item.precio * (item.cantidad + 1) }
            : item
        );
        actualizarVenta(itemsActualizados);
      } else {
        alert("No hay suficiente stock para agregar más unidades.");
      }
    } else {
      const nuevoItem = {
        ...producto,
        id_producto: producto.id_producto, 
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        total: producto.precio
      };
      actualizarVenta([...ventaActual.items, nuevoItem]);
    }
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    const producto = productos.find(p => p.id_producto === id);
    if (producto && nuevaCantidad <= producto.stock) {
      const itemsActualizados = ventaActual.items.map(item =>
        item.id_producto === id
          ? { ...item, cantidad: nuevaCantidad, total: item.precio * nuevaCantidad }
          : item
      );
      actualizarVenta(itemsActualizados);
    } else {
      alert("No hay suficiente stock para esa cantidad.");
    }
  };

  const eliminarProducto = (id) => {
    const itemsActualizados = ventaActual.items.filter(item => item.id_producto !== id);
    actualizarVenta(itemsActualizados);
  };

  const actualizarVenta = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const descuento = ventaActual.descuento;
    const total = subtotal - descuento;

    setVentaActual({
      ...ventaActual,
      items,
      subtotal,
      total
    });
  };

  const aplicarDescuento = (e) => {
    const descuento = Number(e.target.value) || 0;
    const total = ventaActual.subtotal - descuento;

    setVentaActual({
      ...ventaActual,
      descuento,
      total
    });
  };

  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    let coincideCategoria = true;
    if (categoriaFiltro !== 'todas') {
      coincideCategoria = String(producto.id_categoria) === String(categoriaFiltro);
    }
    return coincideBusqueda && coincideCategoria;
  });

  const productosPorCategoria = categorias.reduce((acc, categoria) => {
    const productosDeCategoria = productosFiltrados.filter(
      p => String(p.id_categoria) === String(categoria.id_categoria)
    );
    if (productosDeCategoria.length > 0) {
      acc.push({
        nombre: categoria.nombre,
        productos: productosDeCategoria
      });
    }
    return acc;
  }, []);

  if (categoriaFiltro === 'todas') {
    const productosSinCategoria = productosFiltrados.filter(p => !p.id_categoria || !categorias.some(c => String(c.id_categoria) === String(p.id_categoria)));
    if (productosSinCategoria.length > 0) {
      productosPorCategoria.push({
        nombre: 'Sin categoría',
        productos: productosSinCategoria
      });
    }
  }

  const handleLogout = async () => {
    try {
      // No necesitas un endpoint de logout si solo borras el localStorage
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.clear();
      window.location.href = '/'; // Redirige al login
    }
  };

  const registrarVentaEnAPI = async () => {
    if (ventaActual.items.length === 0) {
      return { success: false, message: "No hay productos en la venta" };
    }

    const nuevaVenta = {
      fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      total: ventaActual.total,
      items: ventaActual.items.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        total: item.total
      }))
    };

    try {
      const response = await fetch('http://localhost:3001/ventas', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // <-- CORRECCIÓN AQUÍ TAMBIÉN
        },
        body: JSON.stringify(nuevaVenta)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Venta exitosa
        console.log('Venta registrada exitosamente'); 
        
        const productosActualizados = productos.map(prod => {
          const itemVendido = ventaActual.items.find(v => v.id_producto === prod.id_producto);
          if (itemVendido) {
            return { ...prod, stock: prod.stock - itemVendido.cantidad };
          }
          return prod;
        });
        
        setProductos(productosActualizados);
        
        setVentaActual({
          items: [],
          subtotal: 0,
          descuento: 0,
          total: 0
        });
        
        return { success: true }; 
        
      } else {
        // Venta fallida
        return { success: false, message: data.message || 'Error desconocido al registrar' }; 
      }
    } catch (error) {
      console.error('Error al enviar la venta:', error);
      return { success: false, message: 'Error de conexión al registrar la venta' }; 
    }
  };
  
  const abrirModalPago = () => {
    setErrorGlobal(''); 
    if (ventaActual.items.length === 0) {
      alert("No hay productos en la venta"); 
      return;
    }
    
    if (ventaActual.total <= 0) {
      (async () => {
        const result = await registrarVentaEnAPI();
        if (!result.success) {
          setErrorGlobal(result.message); 
        }
      })();
    } else {
      setModalPagoAbierto(true);
    }
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={handleLogout} className="logout-button">
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <div className="cajero-panel">
      <button className="floating-logout-btn" onClick={handleLogout} title="Cerrar sesión">
        <span className="logout-icon">⎋</span>
      </button>

      <header className="panel-header">
        <div className="header-content">
          <img src={logo} alt="Logo" className="panel-logo" />
          <div className="user-info">
            <h1>Punto de Venta</h1>
            <p className="saludo">Modo Cajero</p>
          </div>
        </div>
      </header>

      <div className="panel-container">
        <div className="productos-section">
          <div className="section-header">
            <h2>Productos Disponibles</h2>
            <div className="filtros">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="busqueda-input"
              />
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="categoria-select"
              >
                <option value="todas">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="productos-categorizados">
            {categoriaFiltro === 'todas' ? (
              productosPorCategoria.map((grupo, index) => (
                <div key={grupo.nombre || index} className="categoria-grupo">
                  <h3 className="titulo-categoria">{grupo.nombre}</h3>
                  <div className="productos-grid">
                    {grupo.productos.map(producto => (
                      <div
                        key={producto.id_producto}
                        className={`producto-card ${producto.stock <= 0 ? 'agotado' : ''}`}
                        onClick={() => producto.stock > 0 && agregarProducto(producto)}
                      >
                        <h3>{producto.nombre}</h3>
                        <p className="precio">${(Number(producto.precio) || 0).toFixed(2)}</p>
                        <p className="stock">
                          {producto.stock <= 0 ? 'AGOTADO' : `Stock: ${producto.stock}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="productos-grid">
                {productosFiltrados.length === 0 ? (
                  <p>No hay productos para esta categoría.</p>
                ) : (
                  productosFiltrados.map(producto => (
                    <div
                      key={producto.id_producto}
                      className={`producto-card ${producto.stock <= 0 ? 'agotado' : ''}`}
                      onClick={() => producto.stock > 0 && agregarProducto(producto)}
                    >
                      <h3>{producto.nombre}</h3>
                      <p className="precio">${producto.precio.toFixed(2)}</p>
                      <p className="stock">
                        {producto.stock <= 0 ? 'AGOTADO' : `Stock: ${producto.stock}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="venta-section">
          <h2>Venta Actual</h2>
          <div className="items-venta">
            {ventaActual.items.length === 0 ? (
              <p className="sin-items">No hay productos en la venta</p>
            ) : (
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ventaActual.items.map(item => (
                    <tr key={item.id_producto}>
                      <td>{item.nombre}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={productos.find(p => p.id_producto === item.id_producto)?.stock || 1}
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.id_producto, parseInt(e.target.value) || 1)}
                          className="cantidad-input"
                        />
                      </td>
                      <td>${item.precio.toFixed(2)}</td>
                      <td>${item.total.toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => eliminarProducto(item.id_producto)}
                          className="eliminar-btn"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="resumen-venta">
            <div className="resumen-linea">
              <span>Subtotal:</span>
              <span>${ventaActual.subtotal.toFixed(2)}</span>
            </div>
            <div className="resumen-linea">
              <label>Descuento:</label>
              <input
                type="number"
                min="0"
                max={ventaActual.subtotal}
                value={ventaActual.descuento}
                onChange={aplicarDescuento}
                className="descuento-input"
              />
            </div>
            <div className="resumen-linea total">
              <span>Total:</span>
              <span>${ventaActual.total.toFixed(2)}</span>
            </div>
          </div>

          {errorGlobal && <p style={{color: 'red', fontWeight: 'bold', textAlign: 'center'}}>{errorGlobal}</p>}

          <div className="acciones-venta">
            <button
              className="cancelar-btn"
              onClick={() => {
                setVentaActual({ items: [], subtotal: 0, descuento: 0, total: 0 });
                setErrorGlobal(''); 
              }}
            >
              Cancelar Venta
            </button>
            <button
              className="finalizar-btn"
              onClick={abrirModalPago} 
              disabled={ventaActual.items.length === 0}
            >
              Finalizar Venta
            </button>
          </div>
        </div>
      </div>

      <ModalPago
        isOpen={modalPagoAbierto}
        onClose={() => setModalPagoAbierto(false)}
        totalAPagar={ventaActual.total}
        onConfirm={registrarVentaEnAPI} 
      />
    </div>
  );
};

export default CajeroPanel;