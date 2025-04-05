import { useState, useEffect } from "react";
import axios from "axios";
import AdminLogin from "./AdminLogin";
import "./AdminPanel.css";

const API_URL = import.meta.env.VITE_API_URL;

const AdminPanel = () => {
	const [reservas, setReservas] = useState([]);
	const [loggedIn, setLoggedIn] = useState(false);

	const fetchReservas = () => {
		axios.get(`${API_URL}/reservas`, {
			headers: { "ngrok-skip-browser-warning": "true" }
		})
		.then(res => setReservas(res.data))
		.catch(err => console.error("Error al obtener reservas:", err));
	};

	const eliminarReserva = (id) => {
		if (!window.confirm("¿Eliminar esta reserva?")) return;
		axios.delete(`${API_URL}/reservas/${id}`, {
			headers: { "ngrok-skip-browser-warning": "true" }
		})
		.then(() => setReservas(reservas.filter(r => r.id !== id)))
		.catch(err => console.error("Error al eliminar reserva:", err));
	};

	useEffect(() => {
		if (loggedIn) fetchReservas();
	}, [loggedIn]);

	if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

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
						<th>Descripcion</th>
						<th>Acción</th>
					</tr>
				</thead>
				<tbody>
					{reservas.map((r) => (
						<tr key={r.id}>
							<td>{r.id}</td>
							<td>{r.fecha}</td>
							<td>{r.hora}</td>
							<td>{r.status}</td>
							<td>{r.servicio}</td>
							<td>
								<button onClick={() => eliminarReserva(r.id)}>Eliminar</button>
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
