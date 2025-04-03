import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const CalendarComponent = ({ onReserve }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(""); // Estado para la hora seleccionada

  const availableTimes = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00"
  ]; // Horarios disponibles

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  const handleTimeChange = (event) => {
    setTime(event.target.value);
  };

  const handleReserveClick = () => {
    if (date && time) {
      onReserve({ date, time });
    }
  };

  return (
    <div className="calendar-container">
      <h2>Seleccioná una fecha y hora</h2>
      <Calendar onChange={handleDateChange} value={date} />
      
      <label htmlFor="time-select">Seleccionar horario:</label>
      <select id="time-select" value={time} onChange={handleTimeChange}>
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
        Reservar turno
      </button>
    </div>
  );
};

export default CalendarComponent;
