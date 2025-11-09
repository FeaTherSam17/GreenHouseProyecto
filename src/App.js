// Importación de las rutas y componentes necesarios
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login/Login';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import CajeroPanel from './Components/Cajero/CajeroPanel';
import AlmacenistaPanel from './Components/Almacenista/AlmacenistaPanel';
import JardineroPanel from './Components/Jardinero/JardineroPanel';
import './App.css';
import RecoveryPassword from './Components/Login/RecoveryPassword';


// Componente que protege rutas según el rol del usuario
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Se obtiene el usuario guardado en localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Si no hay usuario autenticado, se redirige al login
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  // Si el rol del usuario no está autorizado, se redirige al login con mensaje de error
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace state={{ error: 'No tienes permisos' }} />;
  }
  
  // Si pasa las validaciones, se muestra el componente correspondiente
  return children;
};

// Componente principal de la aplicación
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública para iniciar sesión */}
        <Route path="/" element={<Login />} />

          {/* Ruta de recuperación de contraseña */}
        <Route path="/recuperar-contraseña" element={<RecoveryPassword />} />
        
        {/* Ruta para el administrador, solo accesible si el rol es 1 */}
        <Route 
          path="/AdminDashboard" 
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para el almacenista, accesible solo si el rol es 2 */}
        <Route 
          path="/Almacenista" 
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <AlmacenistaPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para el cajero, accesible solo si el rol es 3 */}
        <Route 
          path="/Cajero" 
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <CajeroPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta para el jardinero, accesible solo si el rol es 4 */}
        <Route 
          path="/Jardinero" 
          element={
            <ProtectedRoute allowedRoles={[4]}>
              <JardineroPanel />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

// Se exporta el componente App para ser usado en el proyecto
export default App;
