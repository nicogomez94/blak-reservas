import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";
import axios from "axios";

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [reservas, setReservas] = useState([]);

    const availableTimes = [
        "09:00", "10:00", "11:00", "12:00",
        "14:00", "15:00", "16:00", "17:00"
    ];
    
    useEffect(() => {
        axios.get("https://fce3-2800-2130-293f-e214-4e07-5b49-a336-477d.ngrok-free.app/reservas", {
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        })
        .then(res => {
            if (Array.isArray(res.data)) {
              setReservas(res.data);
            } else {
              console.error("La respuesta no es un array:", res.data);
              setReservas([]); // fallback seguro
            }
        })
        .catch(err => {
            console.error("Error al cargar reservas:", err);
            setReservas([]); // fallback ante error
        });
    }, []);

    const obtenerHorariosDisponibles = () => {
        const fechaISO = date.toISOString().split("T")[0];
        const horariosReservados = reservas
        .filter((r) => r.fecha === fechaISO)
        .map((r) => r.hora);

        return availableTimes.filter((h) => !horariosReservados.includes(h));
    };

  const handleReserveClick = async () => {
    if (!date || !time) return;

    try {
      const paymentData = {
        transaction_amount: 5000,
        description: `Reserva para el día ${date.toDateString()} a las ${time}`,
        payer: {
          email: "test_user_123456@testuser.com"
        }
      };

      const response = await axios.post("http://localhost:3001/create_preference", paymentData);

      if (response.data.init_point) {
        window.location.href = response.data.init_point;
      } else {
        console.error("No se generó init_point:", response.data);
      }
    } catch (error) {
      console.error("Error al iniciar el pago:", error);
    }
  };

  return (
    <div className="calendar-container">
      <h2>Seleccioná una fecha y hora</h2>

      <Calendar
        onChange={(d) => {
          setDate(d);
          setTime(""); // resetea hora al cambiar fecha
        }}
        value={date}
        tileClassName={({ date: tileDate }) => {
          const fechaISO = tileDate.toISOString().split("T")[0];
          const tieneReserva = reservas.some((r) => r.fecha === fechaISO);
          return tieneReserva ? "reservado" : null;
        }}
      />

      <label htmlFor="time-select">Seleccionar horario:</label>
      <select
        id="time-select"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        disabled={obtenerHorariosDisponibles().length === 0}
      >
        <option value="">Seleccioná un horario</option>
        {obtenerHorariosDisponibles().map((t) => (
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

      {obtenerHorariosDisponibles().length === 0 && (
        <p style={{ color: "red", marginTop: "10px" }}>
          Todos los horarios para esta fecha están reservados.
        </p>
      )}
    </div>
  );
};

export default CalendarComponent;