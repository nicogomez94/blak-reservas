import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLogin from "./AdminLogin";
import "./AdminPanel.css";

const API_URL = import.meta.env.VITE_API_URL;

const AdminPanel = () => {
  const [reservas, setReservas] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [editingReservaId, setEditingReservaId] = useState(null);
  const [editedReserva, setEditedReserva] = useState({});

  const fetchReservas = async () => {
    try {
      const response = await axios.get(`${API_URL}/reservas`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      // Fetch servicios for each reserva
      const reservasWithServicios = await Promise.all(
        response.data.map(async (reserva) => {
          const serviciosResponse = await axios.get(`${API_URL}/servicios/${reserva.id}`, {
            headers: { "ngrok-skip-browser-warning": "true" },
          });
          return { ...reserva, servicios: serviciosResponse.data };
        })
      );

      setReservas(reservasWithServicios);
    } catch (error) {
      console.error("Error al obtener las reservas:", error);
    }
  };

  const eliminarReserva = (id) => {
    axios
      .delete(`${API_URL}/reservas/${id}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      .then(() => setReservas(reservas.filter((r) => r.id !== id)))
      .catch((err) => console.error("Error al eliminar reserva:", err));
  };

  const handleEditarReserva = (reserva) => {
    setEditingReservaId(reserva.id);
    setEditedReserva({ ...reserva });
  };

  const handleCancelarEdicion = () => {
    setEditingReservaId(null);
    setEditedReserva({});
  };

  const handleGuardarCambios = async () => {
    try {
      // Crear una copia del objeto editedReserva sin la propiedad servicios
      const { servicios, ...reservaData } = editedReserva;

      await axios.put(`${API_URL}/reservas/${editingReservaId}`, reservaData, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      setReservas(
        reservas.map((reserva) =>
          reserva.id === editingReservaId ? { ...reserva, ...reservaData, servicios: reserva.servicios } : reserva
        )
      );

      setEditingReservaId(null);
      setEditedReserva({});
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReserva({ ...editedReserva, [name]: value });
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
            <th>Estado</th>
            <th>Total</th>
            <th>Servicios</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id}>
              <td>{reserva.id}</td>
              <td>
                {editingReservaId === reserva.id ? (
                  <input
                    type="text"
                    name="fecha"
                    value={editedReserva.fecha || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  reserva.fecha
                )}
              </td>
              <td>
                {editingReservaId === reserva.id ? (
                  <input
                    type="text"
                    name="status"
                    value={editedReserva.status || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  reserva.status
                )}
              </td>
              <td>
                {editingReservaId === reserva.id ? (
                  <input
                    type="number"
                    name="total"
                    value={editedReserva.total || ""}
                    onChange={handleInputChange}
                  />
                ) : (
                  reserva.total
                )}
              </td>
              <td>
                {reserva.servicios && reserva.servicios.length > 0 ? (
                  <ul>
                    {reserva.servicios.map((servicio) => (
                      <li key={servicio.id}>
                        {servicio.nombre} ({servicio.atributo}: {servicio.valor})
                      </li>
                    ))}
                  </ul>
                ) : (
                  "No hay servicios asociados"
                )}
              </td>
              <td>
                {editingReservaId === reserva.id ? (
                  <>
                    <button onClick={handleGuardarCambios}>Guardar</button>
                    <button onClick={handleCancelarEdicion}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditarReserva(reserva)}>Editar</button>
                    <button onClick={() => eliminarReserva(reserva.id)}>Eliminar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {reservas.length === 0 && (
            <tr>
              <td colSpan="6">No hay reservas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
