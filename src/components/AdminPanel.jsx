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
  const [editingServicioId, setEditingServicioId] = useState(null);
  const [editedServicio, setEditedServicio] = useState({});
  const [expandedReservas, setExpandedReservas] = useState({});

  // Función para agrupar servicios por nombre
  const agruparServicios = (servicios) => {
    const serviciosPorNombre = {};
    
    servicios.forEach(servicio => {
      const clave = `${servicio.nombre}-${servicio.subtipo || ''}`;
      
      if (!serviciosPorNombre[clave]) {
        serviciosPorNombre[clave] = {
          id: servicio.id,
          nombre: servicio.nombre,
          subtipo: servicio.subtipo,
          tamaño: servicio.tamaño,
          reserva_id: servicio.reserva_id,
          atributos: []
        };
      }
      
      if (servicio.atributo && servicio.valor) {
        serviciosPorNombre[clave].atributos.push({
          id: servicio.id,
          atributo: servicio.atributo,
          valor: servicio.valor
        });
      }
    });
    
    return Object.values(serviciosPorNombre);
  };

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
          
          // Agrupar servicios por nombre
          const serviciosAgrupados = agruparServicios(serviciosResponse.data);
          
          return { ...reserva, servicios: serviciosAgrupados };
        })
      );

      setReservas(reservasWithServicios);
    } catch (error) {
      console.error("Error al obtener las reservas:", error);
    }
  };

  const eliminarReserva = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      axios
        .delete(`${API_URL}/reservas/${id}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        })
        .then(() => setReservas(reservas.filter((r) => r.id !== id)))
        .catch((err) => console.error("Error al eliminar reserva:", err));
    }
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
    if (window.confirm("¿Estás seguro de que quieres guardar los cambios en esta reserva?")) {
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedReserva({ ...editedReserva, [name]: value });
  };

  const handleEditarServicio = (servicio, atributo) => {
    setEditingServicioId(`${servicio.id}-${atributo.atributo}`);
    setEditedServicio({ 
      ...servicio,
      atributoId: atributo.id,
      atributoNombre: atributo.atributo,
      atributoValor: atributo.valor
    });
  };

  const handleCancelarEdicionServicio = () => {
    setEditingServicioId(null);
    setEditedServicio({});
  };

  const handleGuardarCambiosServicio = async () => {
    if (window.confirm("¿Estás seguro de que quieres guardar los cambios en este servicio?")) {
      try {
        // Preparar datos para la actualización
        const servicioActualizado = {
          id: editedServicio.atributoId,
          nombre: editedServicio.nombre,
          subtipo: editedServicio.subtipo,
          tamaño: editedServicio.tamaño,
          reserva_id: editedServicio.reserva_id,
          atributo: editedServicio.atributoNombre,
          valor: editedServicio.atributoValor
        };

        await axios.put(`${API_URL}/servicios/${editedServicio.atributoId}`, servicioActualizado, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        // Actualizar la interfaz de usuario
        fetchReservas(); // Refrescar todos los datos

        // Resetear el estado de edición
        setEditingServicioId(null);
        setEditedServicio({});
      } catch (error) {
        console.error("Error al guardar los cambios del servicio:", error);
      }
    }
  };

  const handleServicioInputChange = (e) => {
    const { name, value } = e.target;
    setEditedServicio({ ...editedServicio, [name]: value });
  };

  const toggleExpandReserva = (reservaId) => {
    setExpandedReservas(prev => ({
      ...prev,
      [reservaId]: !prev[reservaId]
    }));
  };

  useEffect(() => {
    if (loggedIn) fetchReservas();
  }, [loggedIn]);

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="admin-panel">
      <h2>Panel de Administración</h2>
      
      <div className="admin-header">
        <h3>Reservas ({reservas.length})</h3>
        <button className="btn-refresh" onClick={fetchReservas}>
          Actualizar Datos
        </button>
      </div>
      
      <table className="reservas-table">
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
            <React.Fragment key={reserva.id}>
              <tr
                className={editingReservaId === reserva.id ? "editing-row" : ""}
                onClick={() => toggleExpandReserva(reserva.id)}
              >
                <td>{reserva.id}</td>
                <td>
                  {editingReservaId === reserva.id ? (
                    <input
                      type="text"
                      name="fecha"
                      value={editedReserva.fecha || ""}
                      onChange={handleInputChange}
                      onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    `$${reserva.total}`
                  )}
                </td>
                <td>
                  {reserva.servicios && reserva.servicios.length > 0
                    ? `${reserva.servicios.length} servicios`
                    : "No hay servicios"}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  {editingReservaId === reserva.id ? (
                    <>
                      <button className="btn_admin_guardar" onClick={handleGuardarCambios}>Guardar</button>
                      <button className="btn_admin_cancelar" onClick={handleCancelarEdicion}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="btn_admin_editar" onClick={(e) => {
                        e.stopPropagation();
                        handleEditarReserva(reserva);
                      }}>Editar</button>
                      <button className="btn_admin_eliminar" onClick={(e) => {
                        e.stopPropagation();
                        eliminarReserva(reserva.id);
                      }}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
              
              {expandedReservas[reserva.id] && (
                <tr className="servicios-expandidos">
                  <td colSpan="6">
                    <div className="servicios-container">
                      <h4>Detalle de Servicios</h4>
                      {reserva.servicios.map((servicio) => (
                        <div key={servicio.id} className="servicio-item">
                          <h5>
                            {servicio.nombre}
                            {servicio.subtipo && <span className="subtipo"> ({servicio.subtipo})</span>}
                            {servicio.tamaño && <span className="tamano"> - {servicio.tamaño}</span>}
                          </h5>
                          
                          <table className="atributos-table">
                            <thead>
                              <tr>
                                <th>Atributo</th>
                                <th>Valor</th>
                                <th>Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {servicio.atributos.map((atributo) => (
                                <tr key={`${servicio.id}-${atributo.atributo}`}>
                                  <td>{atributo.atributo}</td>
                                  <td>
                                    {editingServicioId === `${servicio.id}-${atributo.atributo}` ? (
                                      <input
                                        type="text"
                                        name="atributoValor"
                                        value={editedServicio.atributoValor || ""}
                                        onChange={handleServicioInputChange}
                                      />
                                    ) : (
                                      atributo.valor
                                    )}
                                  </td>
                                  <td>
                                    {editingServicioId === `${servicio.id}-${atributo.atributo}` ? (
                                      <>
                                        <button className="btn_admin_guardar" onClick={handleGuardarCambiosServicio}>Guardar</button>
                                        <button className="btn_admin_cancelar" onClick={handleCancelarEdicionServicio}>Cancelar</button>
                                      </>
                                    ) : (
                                      <button className="btn_admin_editar" onClick={() => handleEditarServicio(servicio, atributo)}>Editar</button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          
          {reservas.length === 0 && (
            <tr>
              <td colSpan="6">No hay reservas registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
