import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");

  const availableTimes = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  const handleReserveClick = async () => {
    if (!date || !time) return;
  
        try {
            const paymentData = {
                transaction_amount: 1500,
                description: `Reserva para el día ${date.toDateString()} a las ${time}`,
                payer: {
                email: "test_user_123456@testuser.com"
                }
            };
    
            const response = await fetch("http://localhost:3001/create_payment", {
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

        }catch (error) {
            console.error("Error al iniciar el pago:", error);
        }
    };


  return (
    <div className="calendar-container">
      <h2>Seleccioná una fecha y hora</h2>
      <Calendar onChange={setDate} value={date} />

      <label htmlFor="time-select">Seleccionar horario:</label>
      <select id="time-select" value={time} onChange={(e) => setTime(e.target.value)}>
        <option value="">Seleccioná un horario</option>
        {availableTimes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {time && (
        <p>Turno seleccionado: {date.toDateString()} a las {time} hs</p>
      )}

      <button 
        onClick={handleReserveClick} 
        disabled={!time} 
        className="reserve-button"
      >
        Pagar reserva ($5000)
      </button>
    </div>
  );
};

export default CalendarComponent;