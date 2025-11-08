import { useState, useEffect } from 'react';
import './UserManagement.css';

// Función para poner en InitCap (primera letra de cada palabra en mayúscula)
function toInitCap(str) {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

// Validación de solo letras y máximo 50 caracteres
function isValidName(str) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}$/.test(str);
}

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    nombre: '',
    apellidoPat: '',
    apellidoMat: '',
    username: '',
    role: 4,
    password: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch('http://localhost:3001/usuarios')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error al cargar usuarios:', error));
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setUserForm({
      nombre: '',
      apellidoPat: '',
      apellidoMat: '',
      username: '',
      role: 4,
      password: ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = async (user) => {
    try {
      const res = await fetch(`http://localhost:3001/usuarios/${user.ID}`);
      if (!res.ok) throw new Error('No se pudo obtener el usuario');
      const userData = await res.json();
  
      setEditingUser(user);
      setUserForm({
        nombre: userData.nombre || '',
        apellidoPat: userData.apellidoPat || '',
        apellidoMat: userData.apellidoMat || '',
        username: userData.username || '',
        role: userData.role || 4,
        password: userData.password || ''
      });
      setErrors({});
      setModalOpen(true);
    } catch (error) {
      alert('Error al cargar los datos del usuario');
      console.error(error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    if ((field === 'nombre' || field === 'apellidoPat' || field === 'apellidoMat') && value.length > 20) return;
    if ((field === 'nombre' || field === 'apellidoPat' || field === 'apellidoMat') && value && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)) return;
    if (field === 'username' && value.length > 10) return;
    if (field === 'username' && value && !/^[A-Za-z0-9]*$/.test(value)) return;
    if (field === 'password' && value.length > 20) return;
    setUserForm({ ...userForm, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let currentErrors = {};
    if (!isValidName(userForm.nombre)) currentErrors.nombre = true;
    if (!isValidName(userForm.apellidoPat)) currentErrors.apellidoPat = true;
    if (userForm.apellidoMat && !isValidName(userForm.apellidoMat)) currentErrors.apellidoMat = true;
    if (!userForm.username) currentErrors.username = true;
    if (!editingUser && !userForm.password) currentErrors.password = true;
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      alert('Corrige los campos marcados en rojo.');
      return;
    }
    setErrors({});
    try {
      const userToSend = {
        ...userForm,
        nombre: toInitCap(userForm.nombre),
        apellidoPat: toInitCap(userForm.apellidoPat),
        apellidoMat: toInitCap(userForm.apellidoMat)
      };
      let response, result;
      if (editingUser) {
        response = await fetch(`http://localhost:3001/usuarios/${editingUser.ID || editingUser.id_usuario}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userToSend)
        });
      } else {
        response = await fetch('http://localhost:3001/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userToSend)
        });
      }
      result = await response.json();
      if (result.success) {
        const updatedUsers = await fetch('http://localhost:3001/usuarios').then(res => res.json());
        setUsers(updatedUsers);
        closeModal();
      } else {
        // Aquí mostramos el mensaje específico si el username ya existe
        if (result.error && result.error.toLowerCase().includes('usuario ya existe')) {
          alert('No se puede insertar: el nombre de usuario ya está registrado en la base de datos.');
        } else {
          alert(result.error || 'Error al guardar usuario');
        }
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const deleteUser = async (id, isAdmin) => {
    if (isAdmin) return;
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const res = await fetch(`http://localhost:3001/usuarios/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          setUsers(users.filter(user => (user.ID || user.id_usuario) !== id));
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    (`${user['Nombre Completo'] || user.nombre || ''} ${user['Apellido Paterno'] || user.apellidoPat || user.apellidoP || ''} ${user['Apellido Materno'] || user.apellidoMat || user.apellidoM || ''}`)
      .toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.Usuario || user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.Rol || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management-container">
      <header className="header">
        <h1>Gestión de Usuarios</h1>
        <p>Administración de usuarios del sistema</p>
      </header>

      <div className="list-section">
        <div className="list-header">
          <h2>Usuarios registrados</h2>
          <div className="actions-row">
            <button className="submit-btn" onClick={openAddModal}>
              + Agregar usuario
            </button>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Contraseña</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>No hay usuarios</td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isAdmin = (user.Rol === 'Admin' || user.Rol === 'Administrador' || user.role === 1);
                  return (
                    <tr key={user.ID}>
                      <td>{user.ID}</td>
                      <td>{user["Nombre Completo"]}</td>
                      <td>{user.Usuario}</td>
                      <td>{user.Rol}</td>
                      <td>{user.Contraseña}</td>
                      <td>{user["Fecha de creación"]}</td>
                      <td>
                        <button
                          className="submit-btn"
                          style={{ background: '#1565c0', marginRight: 8, opacity: isAdmin ? 0.5 : 1, cursor: isAdmin ? 'not-allowed' : 'pointer' }}
                          onClick={() => !isAdmin && openEditModal(user)}
                          disabled={isAdmin}
                        >
                          Editar
                        </button>
                        <button
                          className="submit-btn"
                          style={{ background: '#d32f2f', opacity: isAdmin ? 0.5 : 1, cursor: isAdmin ? 'not-allowed' : 'pointer' }}
                          onClick={() => deleteUser(user.ID, isAdmin)}
                          disabled={isAdmin}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar/editar usuario */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>
            <h2>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre(s)*</label>
                <input
                  type="text"
                  placeholder="Nombre(s)"
                  value={userForm.nombre}
                  maxLength={15}
                  onChange={e => handleInputChange('nombre', e.target.value)}
                  required
                  style={errors.nombre ? { borderColor: 'red' } : {}}
                  disabled={editingUser && (editingUser.Rol === 'Admin' || editingUser.Rol === 'Administrador' || editingUser.role === 1)}
                />
              </div>
              <div className="form-group">
                <label>Apellido Paterno*</label>
                <input
                  type="text"
                  placeholder="Apellido Paterno"
                  value={userForm.apellidoPat}
                  maxLength={20}
                  onChange={e => handleInputChange('apellidoPat', e.target.value)}
                  required
                  style={errors.apellidoPat ? { borderColor: 'red' } : {}}
                  disabled={editingUser && (editingUser.Rol === 'Admin' || editingUser.Rol === 'Administrador' || editingUser.role === 1)}
                />
              </div>
              <div className="form-group">
                <label>Apellido Materno</label>
                <input
                  type="text"
                  placeholder="Apellido Materno"
                  value={userForm.apellidoMat}
                  maxLength={20}
                  onChange={e => handleInputChange('apellidoMat', e.target.value)}
                  style={errors.apellidoMat ? { borderColor: 'red' } : {}}
                  disabled={editingUser && (editingUser.Rol === 'Admin' || editingUser.Rol === 'Administrador' || editingUser.role === 1)}
                />
              </div>
              <div className="form-group">
                <label>Nombre de usuario*</label>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={userForm.username}
                  maxLength={50}
                  onChange={e => handleInputChange('username', e.target.value)}
                  required
                  style={errors.username ? { borderColor: 'red' } : {}}
                  disabled={editingUser && (editingUser.Rol === 'Admin' || editingUser.Rol === 'Administrador' || editingUser.role === 1)}
                />
              </div>
              <div className="form-group">
                <label>Rol*</label>
                <select
                  value={userForm.role}
                  onChange={e => handleInputChange('role', Number(e.target.value))}
                  required
                  disabled={editingUser && (editingUser.Rol === 'Admin' || editingUser.Rol === 'Administrador' || editingUser.role === 1)}
                >
                  <option value={4}>Jardinero</option>
                  <option value={2}>Almacenista</option>
                  <option value={3}>Cajero</option>
                 <option value={1}>Administrador</option>  {/*<-- Elimina o comenta esta línea */}
                </select>
              </div>
              {/* Permitir cambiar contraseña al editar, excepto admin */}
              {(!editingUser || (editingUser && !(editingUser.Rol === 'Admin' || editingUser.Rol === 'Administrador' || editingUser.role === 1))) && (
                <div className="form-group">
                  <label>Contraseña*</label>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={userForm.password}
                    maxLength={20}
                    onChange={e => handleInputChange('password', e.target.value)}
                    required={!editingUser}
                    style={errors.password ? { borderColor: 'red' } : {}}
                  />
                </div>
              )}
              <button className="submit-btn" type="submit">
                {editingUser ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
