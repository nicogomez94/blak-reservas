import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css";
const API_URL = import.meta.env.VITE_API_URL;

const AdminPanel = () => {
	const [reservas, setReservas] = useState([]);

	const fetchReservas = () => {
		axios.get(`${API_URL}/reservas`, {
			headers: { "ngrok-skip-browser-warning": "true" }
		})
		.then(res => setReservas(res.data))
		.catch(err => console.error("Error al obtener reservas:", err));
	};

	const eliminarReserva = (id) => {
		if (!window.confirm("¿Estás seguro de eliminar este turno?")) return;

		axios.delete(`${API_URL}/reservas/${id}`, {
			headers: { "ngrok-skip-browser-warning": "true" }
		})
		.then(() => {
			setReservas(reservas.filter(r => r.id !== id));
		})
		.catch(err => console.error("Error al eliminar reserva:", err));
	};

	useEffect(() => {
		fetchReservas();
	}, []);

	return (
		<div className="admin-panel">
			<h2>Panel de Administración</h2>
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Fecha</th>
						<th>Hora</th>
						<th>Estado</th>
						<th>Acción</th>
					</tr>
				</thead>
				<tbody>
					{reservas.map((reserva) => (
						<tr key={reserva.id}>
							<td>{reserva.id}</td>
							<td>{reserva.fecha}</td>
							<td>{reserva.hora}</td>
							<td>{reserva.status}</td>
							<td>
								<button onClick={() => eliminarReserva(reserva.id)}>
									Eliminar
								</button>
							</td>
						</tr>
					))}
					{reservas.length === 0 && (
						<tr>
							<td colSpan="5">No hay reservas.</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};

export default AdminPanel;