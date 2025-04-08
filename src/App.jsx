import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalendarComponent from "./components/CalendarComponent";
import SeleccionServicio from "./components/SeleccionServicio";
import AdminPanel from "./components/AdminPanel";
import Success from "./components/Success";
import Fail from "./components/Fail";

function App() {
    const [reservedDateTime, setReservedDateTime] = useState(null);
    const [seleccionData, setSeleccionData] = useState(null);

    const handleReserve = ({ date }) => {
        setReservedDateTime({ date });
        alert(`Turno reservado para el ${date.toDateString()}`);
    };

    const handleSeleccionConfirmada = (data) => {
        console.log("Datos de selección recibidos en App:", data);
        setSeleccionData(data);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div>
                            <h1 className="main_h">Reserva tu turno en BLAK</h1>

                            <SeleccionServicio onSeleccionar={handleSeleccionConfirmada} />

                            {seleccionData && seleccionData.servicios.length > 0 && (
                                <CalendarComponent
                                    onReserve={handleReserve}
                                    servicios={seleccionData.servicios}
                                    total={seleccionData.total}
                                />
                            )}

                            {reservedDateTime && (
                                <p
                                    style={{
                                        marginTop: "20px",
                                        fontWeight: "bold",
                                        color: "green"
                                    }}
                                >
                                    Turno confirmado para el {reservedDateTime.date.toDateString()}
                                </p>
                            )}
                        </div>
                    }
                />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/success" element={<Success />} />
                <Route path="/fail" element={<Fail />} />
            </Routes>
        </Router>
    );
}

export default App;