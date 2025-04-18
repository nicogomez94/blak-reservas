import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const API_URL = import.meta.env.VITE_API_URL;

const CalendarComponent = ({ onReserve, servicios }) => {
    const [date, setDate] = useState(new Date());
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const res = await axios.get(`${API_URL}/reservas`, {
                    headers: { "ngrok-skip-browser-warning": "true" }
                });
                setReservas(res.data);
            } catch (error) {
                console.error("Error al cargar reservas:", error);
            }
        };
        fetchReservas();
    }, []);

    const getCuposPorFecha = (fechaISO) => {
        return reservas.filter((r) => r.fecha === fechaISO).length;
    };

    const isFechaLlena = (fecha) => {
        const fechaISO = fecha.toISOString().split("T")[0];
        return getCuposPorFecha(fechaISO) >= 10;
    };

    const calcularMontoTotal = () => {
        if (!servicios || servicios.length === 0) return 5000;
        return servicios.reduce((total, servicio) => total + (servicio.precio || 0), 0);
    };

    const handleReserveClick = async () => {
        const fechaISO = date.toISOString().split("T")[0];
        if (isFechaLlena(date)) {
            alert("Ese día ya está completo. Por favor, elegí otro.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const serviciosSimplificados = servicios.map(s => ({
                servicio: s.servicio || s.nombre,
                categoria: s.categoria || null,
                atributo: s.atributo || null,
                detalle: s.detalle || null,
                descripcion: s.descripcion || null,
                precio: s.precio || 0,
                tamaño: s.tamaño || null,
                tipo: s.tipo || 'simple'
            }));
            
            const montoTotal = calcularMontoTotal();
            
            const paymentData = {
                transaction_amount: montoTotal,
                description: JSON.stringify({
                    fecha: fechaISO,
                    servicios: serviciosSimplificados
                }),
                payer: { 
                    email: "test_user_123456@testuser.com",
                    name: "Usuario de Prueba",
                    identification: {
                        type: "DNI",
                        number: "12345678"
                    }
                }
            };

            const response = await axios.post(
                `${API_URL}/create_preference`, 
                paymentData
            );

            if (response.data && response.data.init_point) {
                window.open(response.data.init_point, '_blank');
            } else {
                throw new Error("No se recibió la URL de pago");
            }
        } catch (error) {
            console.error("Error al iniciar el pago:", error);
            setError("Hubo un error al procesar tu pago. Por favor, intenta nuevamente.");
            
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="calendar-container">
            <h2>Seleccioná una fecha para reservar</h2>

            <Calendar
                onChange={setDate}
                value={date}
                tileDisabled={({ date }) => isFechaLlena(date)}
            />

            <p style={{ marginTop: "20px" }}>
                Fecha seleccionada: {date.toLocaleDateString()}
            </p>

            {error && (
                <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
                    {error}
                </div>
            )}

            <button 
                onClick={handleReserveClick} 
                disabled={loading}
                className={loading ? "loading-button" : ""}
            >
                {loading ? "Procesando..." : `Pagar reserva ($${calcularMontoTotal().toLocaleString()} ARS)`}
            </button>
        </div>
    );
};

export default CalendarComponent;
