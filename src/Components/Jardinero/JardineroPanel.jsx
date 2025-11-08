import React, { useState, useEffect } from 'react';
import './JardineroPanel.css';
import logo from '../Login/assets/logo.png';

const JardineroPanel = () => {
  const [tareas, setTareas] = useState([]);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Mueve cargarTareas fuera del useEffect para poder reutilizarla
  const cargarTareas = async () => {
    try {
      const idJardinero = localStorage.getItem('id_usuario');
      if (!idJardinero) {
        console.error('No se encontró ID de jardinero');
        return;
      }
      const respuesta = await fetch(`http://localhost:3001/tareas/jardinero/${idJardinero}`);
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        console.error('Error al obtener tareas:', datos.error || 'Error desconocido');
        throw new Error(datos.error || 'Error al cargar tareas');
      }
      setTareas(datos.tareas || []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    } finally {
      setCargando(false);
    }
  };

  // Cargar tareas al montar el componente
  useEffect(() => {
    cargarTareas();
  }, []);

  const completarTarea = async (id) => {
    try {
      const respuesta = await fetch(`http://localhost:3001/tareas/${id}/completar`, {
        method: 'PUT'
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al completar tarea');
      }
      // Recargar tareas desde el backend
      cargarTareas();
      if (tareaSeleccionada?.id_tarea === id) {
        setTareaSeleccionada(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatFecha = (fecha) => {
    const opciones = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };

  const tareasFiltradas = tareas.filter(t => 
    filtroPrioridad === 'todas' || t.prioridad === filtroPrioridad
  );

  const cerrarSesion = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (cargando) {
    return (
      <div className="cargando-container">
        <div className="cargando-spinner"></div>
        <p>Cargando tareas...</p>
      </div>
    );
  }

  return (
    <div className="jardinero-container">
      {/* Sidebar */}
      <div className={`sidebar ${menuAbierto ? 'mobile-visible' : ''}`}>
        <div className="logo-container">
          <img src={logo} alt="GreenHouse Logo" className="logo" />
          <h1>GreenHouse</h1>
        </div>
        
        <div className="filtros-sidebar">
          <h3>Filtrar por prioridad:</h3>
          <div className="filtro-group">
            {['todas', 'alta', 'media', 'baja'].map(p => (
              <button 
                key={p}
                className={`filtro-btn prioridad-${p} ${filtroPrioridad === p ? 'active' : ''}`}
                onClick={() => {
                  setFiltroPrioridad(p);
                  setMenuAbierto(false);
                }}
              >
                {p === 'todas' ? 'Todas' : `Prioridad ${p}`}
              </button>
            ))}
          </div>
        </div>
        
        <button className="logout-btn" onClick={cerrarSesion}>
          <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
        </button>
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        <div className="header-mobile">
          <button className="menu-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
            <i className="fas fa-bars"></i>
          </button>
          <h2>Mis Tareas</h2>
        </div>

        <div className="tareas-grid">
          {tareasFiltradas.length === 0 ? (
            <div className="sin-tareas">
              <i className="fas fa-check-circle"></i>
              <p>No hay tareas pendientes</p>
            </div>
          ) : (
            tareasFiltradas.map(tarea => (
              <div 
                key={tarea.id_tarea} 
                className={`tarea-card ${tarea.prioridad} ${tarea.completada ? 'completada' : ''}`}
                onClick={() => setTareaSeleccionada(tarea)}
              >
                <div className="tarea-header">
                  <h3>{tarea.titulo}</h3>
                  <span className="prioridad-badge">{tarea.prioridad.toUpperCase()}</span>
                </div>
                <p className="zona-text">{tarea.zona}</p>
                <div className="tarea-footer">
                  <span className="fecha-text">{formatFecha(tarea.fecha_limite)}</span>
                  {!tarea.completada && (
                    <button 
                      className="completar-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        completarTarea(tarea.id_tarea);
                      }}
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal detalles */}
      {tareaSeleccionada && (
        <div className="modal-overlay" onClick={() => setTareaSeleccionada(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setTareaSeleccionada(null)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="modal-header">
              <h2>{tareaSeleccionada.titulo}</h2>
              <span className={`modal-prioridad ${tareaSeleccionada.prioridad}`}>
                {tareaSeleccionada.prioridad.toUpperCase()}
              </span>
            </div>
            
            <div className="modal-body">
              {/* <div className="info-row">
                <i className="fas fa-map-marker-alt"></i>
                <p><strong>Ubicación:</strong> {tareaSeleccionada.zona}</p>
              </div> */}
              
              <div className="info-row">
                <i className="far fa-calendar-alt"></i>
                <p><strong>Fecha límite:</strong> {formatFecha(tareaSeleccionada.fecha_limite)}</p>
              </div>
              
              <div className="descripcion-container">
                <h4>Descripción:</h4>
                <p>{tareaSeleccionada.descripcion || 'No hay descripción disponible'}</p>
              </div>
            </div>
            
            <div className="modal-footer">
              {!tareaSeleccionada.completada && (
                <button 
                  className="completar-modal-btn"
                  onClick={() => {
                    completarTarea(tareaSeleccionada.id_tarea);
                    setTareaSeleccionada(null);
                  }}
                >
                  <i className="fas fa-check"></i> Marcar como completada
                </button>
              )}
              <button className="cerrar-modal-btn" onClick={() => setTareaSeleccionada(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JardineroPanel;