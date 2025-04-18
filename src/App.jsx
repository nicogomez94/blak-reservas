import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalendarComponent from "./components/CalendarComponent";
import SeleccionServicio from "./components/SeleccionServicio";
import ClienteForm from "./components/ClienteForm";
import AdminPanel from "./components/AdminPanel";
import Success from "./components/Success";
import Fail from "./components/Fail";

function App() {
    const [reservedDateTime, setReservedDateTime] = useState(null);
    const [seleccionData, setSeleccionData] = useState(null);
    const [clienteData, setClienteData] = useState(null);

    const handleReserve = ({ date }) => {
        setReservedDateTime({ date });
        alert(`Turno reservado para el ${date.toDateString()}`);
    };

    const handleSeleccionConfirmada = (data) => {
        console.log("Datos de selección recibidos en App:", data);
        setSeleccionData(data);
        setClienteData(null); // Reset cliente data when selecting new services
    };

    const handleClienteDataSubmit = (data) => {
        console.log("Datos del cliente recibidos:", data);
        setClienteData(data);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="main_parent">
                            <SeleccionServicio onSeleccionar={handleSeleccionConfirmada} />

                            {seleccionData && seleccionData.servicios.length > 0 && !clienteData && (
                                <ClienteForm 
                                    onSubmit={handleClienteDataSubmit} 
                                    servicios={seleccionData.servicios}
                                    total={seleccionData.total}
                                />
                            )}

                            {seleccionData && seleccionData.servicios.length > 0 && clienteData && (
                                <CalendarComponent
                                    onReserve={handleReserve}
                                    servicios={seleccionData.servicios}
                                    total={seleccionData.total}
                                    clienteData={clienteData}
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