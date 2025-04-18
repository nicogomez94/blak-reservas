import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLogin from "./AdminLogin";
import "./AdminPanel.css";

const API_URL = import.meta.env.VITE_API_URL;

// Constante para saltear el login (cambia a false en producción)
const DEV_MODE_SKIP_LOGIN = true; // <- Cambia esto a false cuando necesites el login

const AdminPanel = () => {
  const [reservas, setReservas] = useState([]);
  const [loggedIn, setLoggedIn] = useState(DEV_MODE_SKIP_LOGIN); // Inicializa con el valor de la constante
  const [editingReservaId, setEditingReservaId] = useState(null);
  const [editedReserva, setEditedReserva] = useState({});
  const [editingServicioId, setEditingServicioId] = useState(null);
  const [editedServicio, setEditedServicio] = useState({});
  const [expandedReservas, setExpandedReservas] = useState({});

  // Función para agrupar servicios por nombre
  const agruparServicios = (servicios) => {
    const serviciosPorNombre = {};
    
    servicios.forEach(servicio => {
      const clave = `${servicio.reserva_id}-${servicio.nombre}-${servicio.subtipo || ''}`;
      
      if (!serviciosPorNombre[clave]) {
        serviciosPorNombre[clave] = {
          id: servicio.id,
          nombre: servicio.nombre,
          subtipo: servicio.subtipo,
          tamaño: servicio.tamaño,
          reserva_id: servicio.reserva_id,
          atributos: []
        };
        
        // Convert each service property into an attribute-value pair
        // Skip structural fields that are already used elsewhere
        const skipFields = ['id', 'nombre', 'subtipo', 'tamaño', 'reserva_id'];
        
        Object.entries(servicio).forEach(([key, value]) => {
          if (!skipFields.includes(key)) {
            serviciosPorNombre[clave].atributos.push({
              id: `${servicio.id}-${key}`, // Create a unique ID
              atributo: key,
              valor: value
            });
          }
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
          
          console.log(`Servicios para reserva ${reserva.id}:`, serviciosResponse.data);
          
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

  // Función actualizada para editar servicio
  const handleEditarServicio = (atributo) => {
    setEditingServicioId(atributo.id);
    setEditedServicio({
      id: atributo.id,
      atributoNombre: atributo.atributo,
      atributoValor: atributo.valor
    });
  };

  const handleCancelarEdicionServicio = () => {
    setEditingServicioId(null);
    setEditedServicio({});
  };

  // Función actualizada para guardar cambios de servicio en AdminPanel.jsx
  const handleGuardarCambiosServicio = async () => {
    if (window.confirm("¿Estás seguro de que quieres guardar los cambios en este servicio?")) {
      try {
        // Separar el ID compuesto para obtener el ID del servicio y el nombre del atributo
        const [servicioId, atributoNombre] = editingServicioId.split('-');
        
        // Obtener el ID de la reserva a la que pertenece este servicio
        let reservaId = null;
        
        // Buscar el servicio en todas las reservas para obtener su reservaId
        for (const reserva of reservas) {
          for (const servicio of (reserva.servicios || [])) {
            if (servicio.id.toString() === servicioId) {
              reservaId = reserva.id;
              break;
            }
          }
          if (reservaId) break;
        }
        
        if (!reservaId) {
          throw new Error("No se pudo encontrar la reserva asociada a este servicio");
        }
        
        console.log(`Actualizando servicio ${servicioId} de la reserva ${reservaId}`);
        console.log("Atributo a modificar:", editedServicio.atributoNombre);
        console.log("Nuevo valor:", editedServicio.atributoValor);

        // Crear un payload simplificado con solo el atributo a modificar
        const updatePayload = {
          reserva_id: parseInt(reservaId),
          id: parseInt(servicioId),
          [editedServicio.atributoNombre]: editedServicio.atributoValor
        };
        
        console.log("Payload de actualización:", updatePayload);

        // Enviar la solicitud PUT con el ID de la reserva y el servicio
        const response = await axios.put(
          `${API_URL}/servicios/${reservaId}/${servicioId}`, 
          updatePayload, 
          { headers: { "ngrok-skip-browser-warning": "true" } }
        );
        
        console.log("Respuesta del servidor:", response.data);

        // Si todo fue bien, actualizar la interfaz
        if (response.data.success) {
          // Actualizar la interfaz
          fetchReservas();
          
          // Resetear el estado de edición
          setEditingServicioId(null);
          setEditedServicio({});
        } else {
          throw new Error(response.data.error || "Error desconocido al guardar");
        }
      } catch (error) {
        console.error("Error al guardar los cambios del servicio:", error);
        console.error("Detalles del error:", error.response?.data || error.message);
        alert(`Error al guardar: ${error.message}`);
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
                    ? `${reserva.servicios.length} servicio(s)`
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
                      {reserva.servicios && reserva.servicios.map((servicio) => (
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
                              {servicio.atributos && servicio.atributos.map((atributo) => (
                                <tr key={atributo.id}>
                                  <td>{atributo.atributo}</td>
                                  <td>
                                    {editingServicioId === atributo.id ? (
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
                                    {editingServicioId === atributo.id ? (
                                      <>
                                        <button className="btn_admin_guardar" onClick={handleGuardarCambiosServicio}>Guardar</button>
                                        <button className="btn_admin_cancelar" onClick={handleCancelarEdicionServicio}>Cancelar</button>
                                      </>
                                    ) : (
                                      <button className="btn_admin_editar" onClick={() => handleEditarServicio(atributo)}>Editar</button>
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
