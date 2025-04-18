import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const PaymentInitiator = ({ servicios, fecha, clienteData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const calcularMontoTotal = () => {
    if (!servicios || servicios.length === 0) return 5000;
    return servicios.reduce((total, servicio) => total + (servicio.precio || 0), 0);
  };

  const handlePaymentInit = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      
      const paymentData = {
          transaction_amount: montoTotal,
          description: JSON.stringify({
              fecha: fecha,
              servicios: serviciosSimplificados,
              cliente: clienteData // Incluir los datos del cliente
          }),
          payer: { 
              email: clienteData.email,
              name: clienteData.nombre,
              identification: {
                  type: "DNI",
                  number: "12345678"
              }
          }
      };

      const response = await axios.post(
          `${API_URL}/create_preference`, 
          paymentData
      );

      if (response.data && response.data.init_point) {
          window.open(response.data.init_point, '_blank');
      } else {
          throw new Error("No se recibió la URL de pago");
      }
    } catch (error) {
      console.error("Error al iniciar el pago:", error);
      setError("Hubo un error al procesar tu pago. Por favor, intenta nuevamente.");
      
      if (error.response) {
          console.error("Detalles del error:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>¡Todo listo para confirmar tu reserva!</h2>
      
      <div className="reservation-summary">
        <h3>Resumen de tu reserva:</h3>
        <p><strong>Fecha:</strong> {new Date(fecha).toLocaleDateString()}</p>
        <p><strong>Nombre:</strong> {clienteData.nombre}</p>
        <p><strong>Vehículo:</strong> {clienteData.auto}</p>
        <p><strong>Servicios:</strong> {servicios.length}</p>
        <p><strong>Total:</strong> ${calcularMontoTotal()}</p>
      </div>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      
      <button 
        onClick={handlePaymentInit} 
        disabled={loading}
        className="payment-button"
      >
        {loading ? "Procesando..." : `Confirmar y Pagar $${calcularMontoTotal()}`}
      </button>
    </div>
  );
};

export default PaymentInitiator;