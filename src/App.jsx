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
                        <div className="main_parent">
                            <div className="container_main_h">
                                <div>
                                    <img className="main_logo_img" src="public/logo.png" alt="Logo Blak" />
                                    <h1 className="main_h">Reserva tu Turno!</h1>
                                </div>
                                <div className="description">
                                    <p>
                                        En <strong>BLAK</strong>, ofrecemos servicios de alta calidad para el cuidado y personalización de tu vehículo. 
                                        Desde ploteos hasta polarizados, garantizamos resultados excepcionales que harán que tu auto luzca como nuevo.
                                    </p>
                                    <hr />
                                    <ul className="benefits-list">
                                        <li>✔ Atención personalizada</li>
                                        <li>✔ Materiales de primera calidad</li>
                                        <li>✔ Resultados garantizados</li>
                                        <li>✔ Reserva fácil y rápida</li>
                                    </ul>
                                    <hr />
                                    <p style={{ fontWeight: "bold",color: "light-grey" }}>
                                        ¡Confía en nosotros para darle a tu vehículo el cuidado que se merece!
                                    </p>
                                </div>
                            </div>

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