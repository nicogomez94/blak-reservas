import { useState } from "react";
import CalendarComponent from "./components/CalendarComponent";

function App() {
  const [reservedDateTime, setReservedDateTime] = useState(null);

  const handleReserve = ({ date, time }) => {
    setReservedDateTime({ date, time });
    alert(`Turno reservado para el ${date.toDateString()} a las ${time} hs`);
  };

  return (
    <div>
      <h1>Reserva tu turno en Keramik</h1>
      <CalendarComponent onReserve={handleReserve} />
      
      {reservedDateTime && (
        <p style={{ marginTop: "20px", fontWeight: "bold", color: "green" }}>
          Turno confirmado para el {reservedDateTime.date.toDateString()} a las {reservedDateTime.time} hs
        </p>
      )}
    </div>
  );
}

export default App;