import { useState } from "react";
import "./ClienteForm.css";

const ClienteForm = ({ onSubmit, servicios, total, fecha }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    auto: ""
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) 
      newErrors.nombre = "El nombre es obligatorio";
    
    if (!formData.telefono.trim()) 
      newErrors.telefono = "El teléfono es obligatorio";
    else if (!/^\d{7,15}$/.test(formData.telefono.replace(/\D/g, '')))
      newErrors.telefono = "Ingresa un número de teléfono válido";
    
    if (!formData.email.trim()) 
      newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Ingresa un email válido";
    
    if (!formData.auto.trim()) 
      newErrors.auto = "La información del vehículo es obligatoria";
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Enviar datos al componente padre
    onSubmit(formData);
  };

  return (
    <div className="cliente-form-container">
      <h2>Complete sus datos para finalizar la reserva</h2>
      
      <div className="form-summary">
        <h3>Resumen de reserva</h3>
        <p><strong>Fecha seleccionada:</strong> {new Date(fecha).toLocaleDateString()}</p>
        <p><strong>Servicios seleccionados:</strong> {servicios.length}</p>
        <p><strong>Total a pagar:</strong> ${total}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="cliente-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre completo *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={errors.nombre ? "error" : ""}
          />
          {errors.nombre && <span className="error-message">{errors.nombre}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="telefono">Teléfono *</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={errors.telefono ? "error" : ""}
            placeholder="Ej: 1155667788"
          />
          {errors.telefono && <span className="error-message">{errors.telefono}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "error" : ""}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="auto">Vehículo (Marca, Modelo, Año) *</label>
          <input
            type="text"
            id="auto"
            name="auto"
            value={formData.auto}
            onChange={handleChange}
            className={errors.auto ? "error" : ""}
            placeholder="Ej: Ford Focus 2020"
          />
          {errors.auto && <span className="error-message">{errors.auto}</span>}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button">
            Continuar al pago
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClienteForm;