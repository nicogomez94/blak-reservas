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
      const response = await fetch("http://localhost:3001/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toDateString(), time }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point; // Redirigir a Mercado Pago
      }
    } catch (error) {
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