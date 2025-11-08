// Importación de hooks y librerías necesarias
import { useState } from 'react'; // Importa el hook useState de React para gestionar el estado local.
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // Importa íconos para mostrar/ocultar contraseña.
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate para navegar entre rutas en React.
import './Login.css'; // Importa los estilos del formulario de login.
import logo from './assets/logo.png'; // Importa el logo de la aplicación.

// Componente funcional para el formulario de login
const Login = () => {
  // Estado para mostrar u ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Estado para las credenciales del usuario
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  // Estado para manejar errores y estado de carga
  const [error, setError] = useState(''); // Mensajes de error
  const [loading, setLoading] = useState(false); // Estado de carga para el proceso de login

  // Hook para navegar entre rutas
  const navigate = useNavigate();

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario.
    setError(''); // Limpia cualquier mensaje de error previo.

    // --- BLOQUE DE VALIDACIÓN ---
    // 1. Validar que no estén vacíos (aunque 'required' ayuda)
    if (!credentials.username || !credentials.password) {
      setError('Usuario y contraseña son requeridos');
      return; // Detiene la ejecución aquí
    }

    // 2. Validar longitud (¡lo que pediste!)
    if (credentials.username.length > 50) {
      setError('El usuario no puede tener más de 50 caracteres');
      return; // Detiene la ejecución
    }

    if (credentials.password.length > 100) {
      setError('La contraseña no puede tener más de 100 caracteres');
      return; // Detiene la ejecución
    }
    // --- FIN DEL BLOQUE DE VALIDACIÓN ---

    setLoading(true); // Activa el estado de carga (movido después de la validación)

    try {
      // Petición POST al backend para autenticación
      const response = await fetch('http://localhost:3001/login', { // URL actualizada
        method: 'POST', // Se utiliza el método POST para enviar los datos al servidor.
        headers: {
          'Content-Type': 'application/json', // Se indica que los datos son en formato JSON.
          'Accept': 'application/json' // Se espera una respuesta también en formato JSON.
        },
        body: JSON.stringify({
          username: credentials.username, // Envía el nombre de usuario.
          password: credentials.password  // Envía la contraseña.
        })
      });

      // Se convierte la respuesta en JSON
      const data = await response.json();

      // Si hubo error, se lanza una excepción
      if (!response.ok) {
        console.error(`Error ${response.status}: ${data.error || 'Error en la autenticación'}`); // Muestra el error en la consola
        throw new Error(data.error || 'Error en la autenticación'); // Lanza el error con el mensaje correspondiente
      }
      // Si el login fue exitoso
      if (data.success) {
        // Se guarda el usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('id_usuario', JSON.stringify(data.user.id_usuario));

        // Redirige según el rol del usuario
        switch (data.user.role) {
          case 1: navigate('/AdminDashboard'); break; // Redirige a AdminDashboard si es rol 1 (Administrador).
          case 2: navigate('/Almacenista'); break; // Redirige a Almacenista si es rol 2.
          case 3: navigate('/Cajero'); break; // Redirige a Cajero si es rol 3.
          case 4: navigate('/Jardinero'); break; // Redirige a Jardinero si es rol 4.
          default: setError('Rol no reconocido'); // Si no es un rol válido, muestra un error.
        }
      }
    } catch (err) {
      // Muestra mensaje si no se puede conectar o si hay otro error
      setError(err.message.includes('Failed to fetch')
        ? 'No se pudo conectar al servidor' // Si no se puede conectar al servidor, muestra un mensaje.
        : err.message); // De lo contrario, muestra el mensaje de error general.
    } finally {
      // Finaliza el estado de carga
      setLoading(false); // Desactiva el estado de carga una vez completada la operación.
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" /> {/* Muestra el logo de la aplicación */}
            <h1>GreenHouse Portal</h1> {/* Título de la página */}
          </div>
        </div>

        {/* Formulario de login */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Muestra mensaje de error si existe */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Campo para el nombre de usuario */}
          <div className="input-group">
            <label htmlFor="username">
              <span className="input-icon">👤</span>
              Usuario
            </label>
            <input
              id="username"
              type="text"
              placeholder="Nombre de usuario"
              value={credentials.username}
              onChange={(e) => setCredentials({
                ...credentials,
                username: e.target.value.trim() // Actualiza el nombre de usuario
              })}
              required
              autoComplete="username"
              maxLength={50} // Limite de caraxteres
            />
          </div>

          {/* Campo para la contraseña con opción de mostrarla */}
          <div className="input-group">
            <label htmlFor="password">
              <span className="input-icon">🔒</span>
              Contraseña
            </label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"} // Muestra u oculta la contraseña según el estado
                placeholder="Contraseña"
                value={credentials.password}
                onChange={(e) => setCredentials({
                  ...credentials,
                  password: e.target.value // Actualiza la contraseña
                })}
                required
                autoComplete="current-password"
                maxLength={30} // limite de caracteres
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)} // Alterna el estado de mostrar/ocultar contraseña
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="eye-icon" /> // Icono para ocultar la contraseña
                ) : (
                  <EyeIcon className="eye-icon" /> // Icono para mostrar la contraseña
                )}
              </button>
            </div>
          </div>

          {/* Botón para enviar el formulario */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Verificando...' : 'Ingresar al sistema'} {/* Muestra "Verificando..." mientras se está cargando */}
          </button>
        </form>

        {/* Sección informativa del sistema */}
        <div className="about-section">
          <div className="about-content">
            <h3>Acerca del sistema</h3>
            <p>Versión 1.6.3 (Beta) - Sistema de administración para invernaderos</p>
            <p>© {new Date().getFullYear()} Todos los derechos reservados</p> {/* Muestra el año actual */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;