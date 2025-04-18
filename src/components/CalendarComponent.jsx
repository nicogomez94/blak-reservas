import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const API_URL = import.meta.env.VITE_API_URL;

const CalendarComponent = ({ onFechaSeleccionada, servicios }) => {
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

    const handleContinueClick = () => {
        const fechaISO = date.toISOString().split("T")[0];
        if (isFechaLlena(date)) {
            alert("Ese día ya está completo. Por favor, elegí otro.");
            return;
        }
        
        // Pasar la fecha seleccionada al componente padre
        onFechaSeleccionada(fechaISO);
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
                onClick={handleContinueClick} 
                disabled={loading}
                className={loading ? "loading-button" : ""}
            >
                {loading ? "Procesando..." : "Continuar con tus datos"}
            </button>
        </div>
    );
};

export default CalendarComponent;
