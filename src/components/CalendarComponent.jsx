import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const API_URL = "https://blak-reservas-ib2j.onrender.com";

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

	const handleReserveClick = async () => {
		const fechaISO = date.toISOString().split("T")[0];
		if (isFechaLlena(date)) {
			alert("Ese día ya está completo. Por favor, elegí otro.");
			return;
		}

		try {
			setLoading(true);
			const paymentData = {
				transaction_amount: 10,
				description: JSON.stringify({
					fecha: fechaISO,
					servicios: servicios
				}),
				payer: { email: "test_user_123456@testuser.com" }
			};

			const response = await fetch(`${API_URL}/create_preference`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(paymentData)
			});

			const data = await response.json();
			if (data.init_point) {
				window.location.href = data.init_point;
			} else {
				console.error("No se generó init_point:", data);
			}
		} catch (error) {
			console.error("Error al iniciar el pago:", error);
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
				{loading ? "Redirigiendo al pago..." : `Pagar reserva ($5.000 ARS)`}
			</button>
		</div>
	);
};

export default CalendarComponent;
