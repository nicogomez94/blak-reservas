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

    // Calcular el monto total basado en los servicios seleccionados
    const calcularMontoTotal = () => {
        if (!servicios || servicios.length === 0) return 5000; // Monto por defecto
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
            
            // Simplificamos el objeto de servicios para asegurarnos de enviar solo lo necesario
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
            console.log(`Monto total a pagar: ${montoTotal}`);
            
            // Crear objeto de preferencia
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

            console.log("Enviando datos de pago:", paymentData);

            // Usamos axios en lugar de fetch para mejor manejo de errores
            const response = await axios.post(
                `${API_URL}/create_preference`, 
                paymentData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            // Verificamos la respuesta correctamente
            console.log("Respuesta completa:", response.data);
            
            if (response.data && response.data.init_point) {
                // Redirigimos al checkout de MercadoPago
                window.location.href = response.data.init_point;
            } else {
                console.error("Respuesta incompleta de MercadoPago:", response.data);
                alert("Hubo un problema al conectar con el sistema de pagos. Por favor intenta nuevamente.");
            }
        } catch (error) {
            console.error("Error al iniciar el pago:", error);
            
            // Mostrar mensaje de error más detallado
            if (error.response) {
                console.error("Datos del error:", error.response.data);
                alert(`Error: ${error.response.data.error || "Error en el servidor"}`);
            } else {
                alert("No se pudo conectar con el servidor de pagos. Verifica tu conexión.");
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
                Fecha seleccionada: {date.toDateString()}
            </p>

            <button onClick={handleReserveClick} disabled={loading}>
                {loading ? "Redirigiendo al pago..." : `Pagar reserva ($${calcularMontoTotal().toLocaleString()} ARS)`}
            </button>
        </div>
    );
};

export default CalendarComponent;
