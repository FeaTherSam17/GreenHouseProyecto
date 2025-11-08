import React, { useState, useEffect } from 'react';
import './SuppliersPanel.css';

const SuppliersPanel = () => {
  // Estados
  const [suppliers, setSuppliers] = useState([]);
  const [operations, setOperations] = useState([]);
  const [activeTab, setActiveTab] = useState('operations');
  const [newSupplier, setNewSupplier] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    factura: '' // Factura solo para proveedores
  });
  const [newOperation, setNewOperation] = useState({
    type: 'compra',
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    productos: [], // Array para almacenar productos y cantidades de la operación (usado en devolucion)
    // Eliminado: amount y description
  });
  // Nuevo estado para los detalles del producto en una operación de compra
  const [newProductDetails, setNewProductDetails] = useState({
    nombre: '',
    categoria: '', // Asumiendo que necesitas la categoría para un nuevo producto
    precio: '',
    cantidad: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productosProveedor, setProductosProveedor] = useState([]); // Estado para productos del proveedor seleccionado (usado en devolucion)
  const [categorias, setCategorias] = useState([]); // Estado para cargar categorías

  // Cargar datos iniciales (proveedores y operaciones)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [suppliersRes, operationsRes, categoriasRes] = await Promise.all([
          fetch('http://localhost:3001/suppliers'),
          fetch('http://localhost:3001/operaciones-proveedores'),
          fetch('http://localhost:3001/categorias') // Asumiendo un endpoint para categorías
        ]);

        if (!suppliersRes.ok) throw new Error('Error al cargar proveedores');
        if (!operationsRes.ok) throw new Error('Error al cargar operaciones');
        if (!categoriasRes.ok) throw new Error('Error al cargar categorías');

        const suppliersData = await suppliersRes.json();
        const operationsData = await operationsRes.json();
        const categoriasData = await categoriasRes.json();

        setSuppliers(suppliersData.suppliers || []);
        setOperations(operationsData.operaciones || []);
        setCategorias(categoriasData.categorias || []); // Asumiendo que devuelve { categorias: [...] }
      } catch (err) {
        console.error('Error:', err);
        alert(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cargar productos del proveedor seleccionado cuando cambia el proveedor o se abre el modal (solo para devoluciones)
  useEffect(() => {
    // Cargar productos del proveedor seleccionado solo si el modal está abierto, es de operación
    // y se ha seleccionado un proveedor, y el tipo de operación es 'devolucion'
    if (showModal && modalType === 'operation' && newOperation.supplierId && newOperation.type === 'devolucion') {
      setIsLoading(true);
      // Cambiado para usar el nuevo endpoint
      fetch(`http://localhost:3001/productos-por-proveedor?id_proveedor=${newOperation.supplierId}`)
        .then(res => res.json())
        .then(data => {
          // Asegúrate de que la respuesta tenga una estructura esperada, ej: { success: true, productos: [...] }
          if (data.success) {
            setProductosProveedor(data.productos || []);
          } else {
            console.error('Error al cargar productos del proveedor:', data.error);
            setProductosProveedor([]);
          }
        })
        .catch(err => {
          console.error('Error al cargar productos del proveedor:', err);
          setProductosProveedor([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setProductosProveedor([]); // Limpiar productos si no hay proveedor seleccionado o no es modal de operación de devolución
    }
  }, [showModal, modalType, newOperation.supplierId, newOperation.type]); // Dependencia añadida: newOperation.type

  // Manejar cambio de cantidad de producto en la operación (solo para devoluciones)
  const handleProductQuantityChange = (productId, quantity) => {
    const cantidad = parseInt(quantity) || 0;
    setNewOperation(prevOperation => {
      const updatedProductos = prevOperation.productos.filter(p => p.id_producto !== productId);
      if (cantidad > 0) {
        // Buscar el producto en la lista del proveedor para obtener precio y nombre
        const productInfo = productosProveedor.find(p => p.id_producto === productId);
        if (productInfo) {
           updatedProductos.push({
            id_producto: productId,
            nombre: productInfo.nombre, // Incluir nombre para referencia
            precio: parseFloat(productInfo.precio), // Asegurar que es número
            cantidad: cantidad
          });
        }
      }
      // Recalcular el total basado en los productos seleccionados
      const total = updatedProductos.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0);
      return {
        ...prevOperation,
        productos: updatedProductos,
        // Actualizar el total en el estado de la operación
        // Aunque la tabla operaciones_proveedores tiene 'total',
        // si el backend procesa los productos, este campo podría ser redundante
        // o usarse para validación. Lo mantenemos por ahora.
        amount: total // Este 'amount' se usa para el total en la tabla de operaciones
      };
    });
  };

  // Manejar cambio en los campos del nuevo producto (solo para compras)
  const handleNewProductDetailsChange = (e) => {
    const { name, value } = e.target;
    setNewProductDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  // Función para manejar el envío del formulario de proveedor (nuevo o edición)
  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Aquí va la lógica para enviar los datos del proveedor al backend
    // Puedes usar 'newSupplier' para datos de un nuevo proveedor
    // o 'editingSupplier' para datos de un proveedor existente

    const supplierDataToSend = editingSupplier ? {
      // Datos del proveedor editado
      id_proveedor: editingSupplier.id_proveedor,
      nombre: editingSupplier.nombre,
      contacto: editingSupplier.contacto,
      telefono: editingSupplier.telefono,
      email: editingSupplier.email,
      factura: editingSupplier.factura
    } : {
      // Datos del nuevo proveedor
      nombre: newSupplier.nombre,
      contacto: newSupplier.contacto,
      telefono: newSupplier.telefono,
      email: newSupplier.email,
      factura: newSupplier.factura
    };

    const url = editingSupplier
      ? `http://localhost:3001/suppliers/${editingSupplier.id_proveedor}` // Endpoint para actualizar
      : 'http://localhost:3001/suppliers'; // Endpoint para crear

    const method = editingSupplier ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierDataToSend),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingSupplier ? '✅ Proveedor actualizado correctamente.' : '✅ Proveedor registrado correctamente.');
        // Actualizar la lista de proveedores después de la operación
        const suppliersRes = await fetch('http://localhost:3001/suppliers');
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData.suppliers || []);

        // Cerrar modal y resetear estados
        setShowModal(false);
        setModalType('');
        setNewSupplier({ nombre: '', contacto: '', telefono: '', email: '', factura: '' });
        setEditingSupplier(null);
      } else {
        alert(`❌ Error: ${data.error || 'Hubo un error al procesar el proveedor.'}`);
      }
    } catch (err) {
      console.error('Error al procesar proveedor:', err);
      alert('Hubo un error al comunicarse con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };


  // Guardar Operación (ahora con lógica condicional para compra/devolucion)
  const handleOperationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let operationDataToSend = {
      tipo: newOperation.type,
      id_proveedor: newOperation.supplierId,
      fecha: newOperation.date,
      total: 0, // Se calculará o se enviará 0 si el backend lo calcula
      productos: [] // Array de productos a enviar
    };

    if (newOperation.type === 'compra') {
      // Validar campos del nuevo producto para compra
      if (!newProductDetails.nombre || !newProductDetails.categoria || !newProductDetails.precio || !newProductDetails.cantidad) {
        alert('Debes completar todos los campos del producto para la compra.');
        setIsLoading(false);
        return;
      }
      const cantidad = parseInt(newProductDetails.cantidad);
      const precio = parseFloat(newProductDetails.precio);
      if (cantidad <= 0 || isNaN(cantidad) || precio <= 0 || isNaN(precio)) {
         alert('La cantidad y el precio deben ser números positivos.');
         setIsLoading(false);
         return;
      }

      // Formatear datos del nuevo producto para enviar
      operationDataToSend.productos = [{
        nombre: newProductDetails.nombre,
        id_categoria: newProductDetails.categoria, // Enviar ID de categoría
        precio: precio,
        cantidad: cantidad
      }];
      operationDataToSend.total = precio * cantidad; // Calcular total para la compra

    } else if (newOperation.type === 'devolucion') {
      // Validar que se hayan seleccionado productos para devolución
      if (newOperation.productos.length === 0) {
        alert('Debes seleccionar al menos un producto para la devolución.');
        setIsLoading(false);
        return;
      }
       // Validar que las cantidades de devolución no excedan el stock
       for (const selectedProd of newOperation.productos) {
           const originalProd = productosProveedor.find(p => p.id_producto === selectedProd.id_producto);
           if (!originalProd || selectedProd.cantidad > originalProd.stock) {
               alert(`La cantidad a devolver para ${selectedProd.nombre} excede el stock disponible (${originalProd?.stock || 0}).`);
               setIsLoading(false);
               return;
           }
       }


      // Los productos ya están en newOperation.productos con cantidad y precio
      operationDataToSend.productos = newOperation.productos;
      operationDataToSend.total = newOperation.productos.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0);
    }

    try {
      const response = await fetch('http://localhost:3001/operaciones-proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operationDataToSend)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error en el servidor');

      // Recargar todas las operaciones para asegurar que se muestren los datos correctos
      const operationsRes = await fetch('http://localhost:3001/operaciones-proveedores');
      if (!operationsRes.ok) throw new Error('Error al recargar operaciones');
      const operationsData = await operationsRes.json();
      setOperations(operationsData.operaciones || []);


      // Resetear formulario y estados
      setShowModal(false);
      setNewOperation({
        type: 'compra',
        supplierId: '',
        date: new Date().toISOString().split('T')[0],
        productos: [],
      });
      setNewProductDetails({ // Resetear también los detalles del nuevo producto
        nombre: '',
        categoria: '',
        precio: '',
        cantidad: ''
      });
      setProductosProveedor([]); // Limpiar productos del proveedor

      alert(data.message || 'Operación registrada exitosamente');
    } catch (err) {
      console.error('Error al guardar operación:', err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar Proveedor
  const handleDeleteSupplier = async (id_proveedor) => {
    if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/suppliers/${id_proveedor}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setSuppliers(suppliers.filter(s => s.id_proveedor !== id_proveedor));
        alert('Proveedor eliminado correctamente.');
      } else {
        // Aquí interpretamos el error del backend
        if (data.error && data.error.toLowerCase().includes('productos asociados')) {
          alert('No se puede eliminar el proveedor porque tiene productos asociados.');
        } else {
          alert(data.error || 'Error al eliminar proveedor');
        }
      }
    } catch (err) {
      alert('Error al eliminar proveedor');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar Operación
  const deleteOperation = async (id) => {
    if (!window.confirm('¿Eliminar esta operación?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/operaciones-proveedores/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al eliminar');

      // Recargar todas las operaciones para asegurar que el stock se refleje correctamente
      const operationsRes = await fetch('http://localhost:3001/operaciones-proveedores');
      if (!operationsRes.ok) throw new Error('Error al recargar operaciones después de eliminar');
      const operationsData = await operationsRes.json();
      setOperations(operationsData.operaciones || []);

      alert(data.message || 'Operación eliminada');
    } catch (err) {
      console.error('Error al eliminar operación:', err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="suppliers-container">
      <header className="suppliers-header">
        <h1>🌿 Gestión de Proveedores</h1>
        <p>Compras y operaciones con proveedores</p>
      </header>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="suppliers-content">
        <nav className="suppliers-nav">
          <button
            className={activeTab === 'operations' ? 'active' : ''}
            onClick={() => setActiveTab('operations')}
            disabled={isLoading}
          >
            Operaciones
          </button>
          <button
            className={activeTab === 'suppliers' ? 'active' : ''}
            onClick={() => setActiveTab('suppliers')}
            disabled={isLoading}
          >
            Proveedores
          </button>
        </nav>

        <div className="actions-panel">
          {activeTab === 'operations' && (
            <button
              className="action-button primary"
              onClick={() => {
                setModalType('operation');
                setNewOperation({
                  type: 'compra', // Default a compra
                  supplierId: suppliers[0]?.id_proveedor || '',
                  date: new Date().toISOString().split('T')[0],
                  productos: [],
                });
                 setNewProductDetails({ // Resetear detalles del nuevo producto al abrir modal de operación
                    nombre: '',
                    categoria: '',
                    precio: '',
                    cantidad: ''
                 });
                setShowModal(true);
              }}
              disabled={isLoading || suppliers.length === 0}
            >
              + Registrar Operación
            </button>
          )}

          {activeTab === 'suppliers' && (
            <button
              className="action-button primary"
              onClick={() => {
                setModalType('supplier');
                setNewSupplier({
                  nombre: '',
                  contacto: '',
                  telefono: '',
                  email: '',
                  factura: ''
                });
                setEditingSupplier(null);
                setShowModal(true);
              }}
              disabled={isLoading}
            >
              + Nuevo Proveedor
            </button>
          )}
        </div>

        <div className="main-content">
          {activeTab === 'operations' ? (
            <div className="operations-section">
              <h2>Historial de Operaciones</h2>
              {operations.length === 0 ? (
                <p className="no-data">No hay operaciones registradas</p>
              ) : (
                <div className="operations-table-container">
                  <table className="operations-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Proveedor</th>
                        <th>Fecha</th>
                        {/* <th>Descripción</th> Eliminado */}
                        <th>Monto</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operations.map(op => (
                        <tr key={op.id_operacion}>
                          <td>
                            <span className={`op-badge ${op.tipo}`}>
                              {op.tipo === 'compra' ? '🛒 Compra' : '↩️ Devolución'}
                            </span>
                          </td>
                          <td>{op.proveedor}</td>
                          <td>{formatDate(op.fecha)}</td>
                          {/* <td>{op.descripcion}</td> Eliminado */}
                          <td>{formatCurrency(op.total)}</td>
                          <td>
                            <button
                              className="action-icon danger"
                              onClick={() => deleteOperation(op.id_operacion)}
                              disabled={isLoading}
                            >
                              🗑️ Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="suppliers-section">
              <h2>Proveedores</h2>
              {suppliers.length === 0 ? (
                <p className="no-data">No hay proveedores registrados</p>
              ) : (
                <div className="suppliers-table-container">
                  <table className="suppliers-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Contacto</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map(supplier => (
                        <tr key={supplier.id_proveedor}>
                          <td>{supplier.nombre}</td>
                          <td>{supplier.contacto}</td>
                          <td>{supplier.telefono}</td>
                          <td>{supplier.email}</td>
                          <td>
                            <button
                              onClick={() => {
                                setModalType('supplier');
                                setEditingSupplier(supplier);
                                setShowModal(true);
                              }}
                              disabled={isLoading}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id_proveedor)}
                              disabled={isLoading}
                            >
                              🗑️ Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para formularios */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => !isLoading && setShowModal(false)}
              disabled={isLoading}
            >
              ×
            </button>

            {modalType === 'operation' ? (
              <form onSubmit={handleOperationSubmit}>
                <h2>Registrar Nueva Operación</h2>

                <div className="form-group">
                  <label>Tipo de Operación *</label>
                  <select
                    value={newOperation.type}
                    onChange={(e) => {
                        setNewOperation({
                            ...newOperation,
                            type: e.target.value,
                            productos: [] // Limpiar productos seleccionados al cambiar tipo
                        });
                        setNewProductDetails({ // Limpiar detalles del nuevo producto al cambiar tipo
                            nombre: '',
                            categoria: '',
                            precio: '',
                            cantidad: ''
                        });
                        setProductosProveedor([]); // Limpiar productos del proveedor al cambiar tipo
                    }}
                    required
                    disabled={isLoading}
                  >
                    <option value="compra">Compra</option>
                    <option value="devolucion">Devolución</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Proveedor *</label>
                  <select
                    value={newOperation.supplierId}
                    onChange={(e) => setNewOperation({
                      ...newOperation,
                      supplierId: e.target.value,
                      productos: [] // Limpiar productos al cambiar proveedor
                    })}
                    required
                    disabled={isLoading || suppliers.length === 0}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map(s => (
                      <option key={s.id_proveedor} value={s.id_proveedor}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={newOperation.date}
                    onChange={(e) => setNewOperation({
                      ...newOperation,
                      date: e.target.value
                    })}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Sección de productos condicional */}
                {newOperation.type === 'compra' ? (
                    // Campos para agregar un nuevo producto en una COMPRA
                    <div className="form-group">
                        <label>Detalles del Nuevo Producto *</label>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre del Producto"
                            value={newProductDetails.nombre}
                            onChange={handleNewProductDetailsChange}
                            required
                            disabled={isLoading}
                            maxLength={50}
                        />
                         <select
                            name="categoria"
                            value={newProductDetails.categoria}
                            onChange={handleNewProductDetailsChange}
                            required
                            disabled={isLoading || categorias.length === 0}
                         >
                            <option value="">Seleccionar Categoría</option>
                            {categorias.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                    {cat.nombre}
                                </option>
                            ))}
                         </select>
                        <input
                            type="number"
                            name="precio"
                            placeholder="Precio Individual"
                            value={newProductDetails.precio}
                            onChange={handleNewProductDetailsChange}
                            required
                            min="0.01"
                            step="0.01"
                            disabled={isLoading}
                        />
                        <input
                            type="number"
                            name="precioCompra"
                            placeholder="Precio de Compra"
                            value={newProductDetails.precioCompra}
                            onChange={handleNewProductDetailsChange}
                            min="0.01"
                            step="0.01"
                            required
                        />
                        <input
                            type="number"
                            name="cantidad"
                            placeholder="Cantidad"
                            value={newProductDetails.cantidad}
                            onChange={handleNewProductDetailsChange}
                            required
                            min="1"
                            step="1"
                            disabled={isLoading}
                        />
                    </div>
                ) : (
                    // Lista de productos existentes para DEVOLUCION
                    <div className="form-group">
                        <label>Productos a devolver *</label>
                        {isLoading ? (
                            <p>Cargando productos...</p>
                        ) : productosProveedor.length === 0 ? (
                            <p>No hay productos asociados a este proveedor.</p>
                        ) : (
                            <div className="productos-operacion-list">
                                {productosProveedor.map(prod => (
                                    <div key={prod.id_producto} className="producto-item">
                                        <span>{prod.nombre} ({formatCurrency(prod.precio)})</span>
                                        <input
                                            type="number"
                                            min="0"
                                            // Max stock solo para devoluciones
                                            max={newOperation.type === 'devolucion' ? prod.stock : undefined}
                                            value={
                                                newOperation.productos.find(p => p.id_producto === prod.id_producto)?.cantidad || ''
                                            }
                                            onChange={e => handleProductQuantityChange(prod.id_producto, e.target.value)}
                                            disabled={isLoading}
                                            placeholder="Cantidad"
                                        />
                                         {/* Mostrar stock solo para devoluciones */}
                                         {newOperation.type === 'devolucion' && (
                                             <span> Stock: {prod.stock}</span>
                                         )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                 {/* Mostrar el total calculado (solo para compra, o basado en seleccion para devolucion) */}
                 <div className="form-group">
                  <label>Total Calculado:</label>
                  <p>
                    {newOperation.type === 'compra'
                        ? formatCurrency(parseFloat(newProductDetails.precio || 0) * parseInt(newProductDetails.cantidad || 0))
                        : formatCurrency(newOperation.productos.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0))
                    }
                  </p>
                </div>


                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading || (newOperation.type === 'compra' && (!newProductDetails.nombre || !newProductDetails.categoria || !newProductDetails.precio || !newProductDetails.cantidad || parseFloat(newProductDetails.precio) <= 0 || parseInt(newProductDetails.cantidad) <= 0)) || (newOperation.type === 'devolucion' && newOperation.productos.length === 0)}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Operación'}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => !isLoading && setShowModal(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSupplierSubmit}>
                <h2>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>

                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={editingSupplier?.nombre || newSupplier.nombre}
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            nombre: e.target.value
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            nombre: e.target.value
                          })
                    }
                    required
                    maxLength={50}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    value={editingSupplier?.telefono || newSupplier.telefono}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            telefono: onlyNums
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            telefono: onlyNums
                          });
                    }}
                    required
                    pattern="[0-9]{10,15}"
                    maxLength={15}
                    minLength={10}
                    placeholder="Ej: 5512345678"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={editingSupplier?.email || newSupplier.email}
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            email: e.target.value
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            email: e.target.value
                          })
                    }
                    required
                    maxLength={40}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Contacto *</label>
                  <input
                    type="text"
                    value={editingSupplier?.contacto || newSupplier.contacto}
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            contacto: e.target.value
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            contacto: e.target.value
                          })
                    }
                    required
                    maxLength={30}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Factura (Opcional)</label>
                  <input
                    type="text"
                    value={editingSupplier?.factura || newSupplier.factura}
                    onChange={(e) =>
                      editingSupplier
                        ? setEditingSupplier({
                            ...editingSupplier,
                            factura: e.target.value
                          })
                        : setNewSupplier({
                            ...newSupplier,
                            factura: e.target.value
                          })
                    }
                    maxLength={30}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading || (!editingSupplier && (!newSupplier.nombre || !newSupplier.contacto || !newSupplier.telefono || !newSupplier.email))}
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Proveedor'}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => !isLoading && setShowModal(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPanel;
