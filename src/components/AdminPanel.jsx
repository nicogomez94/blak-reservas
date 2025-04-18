import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLogin from "./AdminLogin";
import "./AdminPanel.css";

const API_URL = import.meta.env.VITE_API_URL;

const DEV_MODE_SKIP_LOGIN = true;

const AdminPanel = () => {
  const [reservas, setReservas] = useState([]);
  const [loggedIn, setLoggedIn] = useState(DEV_MODE_SKIP_LOGIN); // Inicializa con el valor de la constante
  const [editingReservaId, setEditingReservaId] = useState(null);
  const [editedReserva, setEditedReserva] = useState({});
  const [editingServicioId, setEditingServicioId] = useState(null);
  const [editedServicio, setEditedServicio] = useState({});
  const [expandedReservas, setExpandedReservas] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: 'id',        
    direction: 'desc' // Mantener 'desc' para que el más reciente (ID mayor) aparezca primero
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all'); // Categoría de búsqueda (nombre, fecha, etc.)

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

  const handleGuardarCambiosServicio = async () => {
    if (window.confirm("¿Estás seguro de que quieres guardar los cambios en este servicio?")) {
      try {
        const idParts = editingServicioId.split('-');
        const servicioId = idParts[0]; // El primer elemento es siempre el ID
        const atributoNombre = idParts.slice(1).join('-');
        
        console.log(`ID servicio: ${servicioId}, Atributo: ${atributoNombre}`);
        
        // Buscar el servicio y la reserva asociada
        let reservaId = null;
        let nombreServicio = null;
        
        // Buscar el servicio en todas las reservas
        for (const reserva of reservas) {
          for (const servicio of (reserva.servicios || [])) {
            if (servicio.id.toString() === servicioId) {
              reservaId = reserva.id;
              nombreServicio = servicio.nombre;
              break;
            }
            
            // Si no encontramos por ID, también buscamos en los atributos
            if (!reservaId) {
              for (const atributo of servicio.atributos || []) {
                if (atributo.id.toString().startsWith(servicioId)) {
                  reservaId = reserva.id;
                  nombreServicio = servicio.nombre;
                  break;
                }
              }
            }
          }
          if (reservaId) break;
        }
        
        if (!reservaId) {
          throw new Error("No se pudo encontrar la reserva asociada a este servicio");
        }
        
        console.log(`Actualizando servicio de "${nombreServicio}" en reserva ${reservaId}`);
        console.log(`Atributo a modificar: "${editedServicio.atributoNombre}", Nuevo valor: "${editedServicio.atributoValor}"`);
        
        // Crear un payload con el nombre del servicio para mejor búsqueda en el servidor
        const updatePayload = {
          reserva_id: parseInt(reservaId),
          id: parseInt(servicioId),
          nombre: nombreServicio,
          [editedServicio.atributoNombre]: editedServicio.atributoValor
        };
        
        console.log("Payload de actualización:", updatePayload);

        // Enviar la solicitud PUT
        const response = await axios.put(
          `${API_URL}/servicios/${reservaId}/${servicioId}`, 
          updatePayload, 
          { headers: { "ngrok-skip-browser-warning": "true" } }
        );
        
      } catch (error) {
        // Manejo de errores
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredReservas = React.useMemo(() => {
    if (!searchTerm.trim()) return reservas;
    
    return reservas.filter(reserva => {
      const searchTermLower = searchTerm.toLowerCase();
      
      // Buscar en todos los campos
      if (searchCategory === 'all') {
        return (
          (reserva.id?.toString() || '').includes(searchTermLower) ||
          (reserva.fecha || '').toLowerCase().includes(searchTermLower) ||
          (reserva.nombre || '').toLowerCase().includes(searchTermLower) ||
          (reserva.email || '').toLowerCase().includes(searchTermLower) ||
          (reserva.telefono || '').toLowerCase().includes(searchTermLower) ||
          (reserva.auto || '').toLowerCase().includes(searchTermLower) ||
          (reserva.status || '').toLowerCase().includes(searchTermLower) ||
          // Buscar también en servicios
          (reserva.servicios || []).some(servicio => 
            (servicio.nombre || '').toLowerCase().includes(searchTermLower)
          )
        );
      }
      
      // Buscar en un campo específico
      if (searchCategory === 'id') {
        return (reserva.id?.toString() || '').includes(searchTermLower);
      }
      if (searchCategory === 'fecha') {
        return (reserva.fecha || '').toLowerCase().includes(searchTermLower);
      }
      if (searchCategory === 'nombre') {
        return (reserva.nombre || '').toLowerCase().includes(searchTermLower);
      }
      if (searchCategory === 'email') {
        return (reserva.email || '').toLowerCase().includes(searchTermLower);
      }
      if (searchCategory === 'telefono') {
        return (reserva.telefono || '').toLowerCase().includes(searchTermLower);
      }
      if (searchCategory === 'auto') {
        return (reserva.auto || '').toLowerCase().includes(searchTermLower);
      }
      if (searchCategory === 'status') {
        return (reserva.status || '').toLowerCase().includes(searchTermLower);
      }
      
      return false;
    });
  }, [reservas, searchTerm, searchCategory]);

  const sortedReservas = React.useMemo(() => {
    const sortableReservas = [...filteredReservas]; // Cambiar reservas por filteredReservas
    if (sortConfig.key) {
      sortableReservas.sort((a, b) => {
        // Manejar valores nulos o indefinidos
        if (a[sortConfig.key] === null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (b[sortConfig.key] === null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        // Para fechas, comparar objetos Date
        if (sortConfig.key === 'fecha') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.fecha) - new Date(b.fecha)
            : new Date(b.fecha) - new Date(a.fecha);
        }
        
        // Para números (como precio total)
        if (sortConfig.key === 'total') {
          return sortConfig.direction === 'asc'
            ? a.total - b.total
            : b.total - a.total;
        }
        
        // Para textos (nombre, email, etc)
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableReservas;
  }, [filteredReservas, sortConfig]); // Cambiar la dependencia de reservas a filteredReservas

  useEffect(() => {
    if (loggedIn) fetchReservas();
  }, [loggedIn]);

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="admin-panel">
      <h2>Panel de Administración</h2>
      
      <div className="admin-header">
        <h3>
          Reservas {searchTerm ? `(${sortedReservas.length} de ${reservas.length})` : `(${reservas.length})`}
        </h3>
        <button className="btn-refresh" onClick={fetchReservas}>
          Actualizar Datos
        </button>
      </div>
      
      <div className="search-container">
        <div className="search-inputs">
          <select 
            value={searchCategory} 
            onChange={(e) => setSearchCategory(e.target.value)}
            className="search-category"
          >
            <option value="all">Todos los campos</option>
            <option value="id">ID</option>
            <option value="fecha">Fecha</option>
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
            <option value="telefono">Teléfono</option>
            <option value="auto">Vehículo</option>
            <option value="status">Estado</option>
          </select>
          
          <input
            type="text"
            placeholder="Buscar reservas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <button 
            onClick={() => setSearchTerm('')}
            className="search-clear-btn"
            title="Limpiar búsqueda"
          >
            ✖
          </button>
        </div>
      </div>
      
      <table className="reservas-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>
              ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('fecha')}>
              Fecha {sortConfig.key === 'fecha' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('nombre')}>
              Cliente {sortConfig.key === 'nombre' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('status')}>
              Estado {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('total')}>
              Total {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
            </th>
            <th>Servicios</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {sortedReservas.map((reserva) => (
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
                    <>
                      <input
                        type="text"
                        name="nombre"
                        value={editedReserva.nombre || ""}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Nombre"
                      />
                      <input
                        type="text"
                        name="telefono"
                        value={editedReserva.telefono || ""}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Teléfono"
                        style={{marginTop: '5px'}}
                      />
                      <input
                        type="text"
                        name="email"
                        value={editedReserva.email || ""}
                        onChange={handleInputChange}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Email"
                        style={{marginTop: '5px'}}
                      />
                    </>
                  ) : (
                    <>
                      {reserva.nombre || "Sin datos"}<br/>
                      {reserva.telefono && `📞 ${reserva.telefono}`}<br/>
                      {reserva.email && `✉️ ${reserva.email}`}
                    </>
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
                  <td colSpan="7">
                    <div className="servicios-container">
                      <h4>Detalle de Servicios</h4>
                      
                      {reserva.auto && (
                        <div className="vehicle-info">
                          <strong>Vehículo:</strong> {reserva.auto}
                        </div>
                      )}
                      
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
          
          {sortedReservas.length === 0 && (
            <tr>
              <td colSpan="7" className="no-results">
                {reservas.length === 0 
                  ? "No hay reservas registradas." 
                  : "No se encontraron resultados para tu búsqueda."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
