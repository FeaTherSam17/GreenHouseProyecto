import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const RecuperarContraseña = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const handleRecovery = async () => {
        if (!username.trim()) {
            setError('Debes ingresar tu nombre de usuario');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`http://localhost:3001/usuarios/${username}/actualizar-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({nuevaPassword: '1234' })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al enviar el enlace');
            }

            setSuccess(`Se ha enviado un enlace de recuperación al correo del usuario "${username}".`);
            setUsername('');
        } catch (err) {
            setError(err.message.includes('Failed to fetch') ? 'No se pudo conectar al servidor' : err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Recuperar Contraseña</h1>
                </div>

                <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="input-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="button"
                        className="login-button"
                        onClick={handleRecovery}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Enviar enlace de recuperación'}
                    </button>

                    <button
                        type="button"
                        className="login-button"
                        style={{ backgroundColor: '#999', marginTop: '10px' }}
                        onClick={() => navigate('/')}
                    >
                        Regresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RecuperarContraseña;
