import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Success.css';

const API_URL = import.meta.env.VITE_API_URL;

const Success = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    
    useEffect(() => {
        const verificarReserva = async () => {
            try {
                if (!token) {
                    setStatus('error');
                    setMessage('No se pudo verificar el estado de la reserva');
                    return;
                }
                
                // Esperar un momento para dar tiempo al webhook
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const response = await axios.get(`${API_URL}/verificar-reserva/${token}`);
                
                setStatus(response.data.status);
                setMessage(response.data.message);
                
                // Si hubo un error, redirigir a la página de error después de 5 segundos
                if (response.data.status === 'error') {
                    setTimeout(() => {
                        navigate('/fail');
                    }, 5000);
                }
            } catch (error) {
                console.error('Error al verificar reserva:', error);
                setStatus('error');
                setMessage('Error al verificar la reserva');
            }
        };
        
        verificarReserva();
    }, [token, navigate]);
    
    return (
        <div className="success-container">
            <h1>
                {status === 'loading' && 'Verificando tu reserva...'}
                {status === 'success' && '¡Reserva Confirmada!'}
                {status === 'pending' && 'Reserva Pendiente'}
                {status === 'error' && 'Hubo un problema'}
            </h1>
            
            {status === 'loading' && (
                <div className="loading-spinner"></div>
            )}
            
            <p>{message}</p>
            
            {status === 'success' && (
                <div className="success-message">
                    <p>Tu reserva ha sido confirmada exitosamente.</p>
                    <p>Te enviaremos un correo con los detalles.</p>
                </div>
            )}
            
            {status === 'error' && (
                <div className="error-message">
                    <p>Te redirigiremos a la página de error en 5 segundos...</p>
                </div>
            )}
            
            <div className="buttons">
                <button 
                    onClick={() => navigate('/')} 
                    className="home-button"
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default Success;