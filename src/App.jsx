import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalendarComponent from "./components/CalendarComponent";
import SeleccionServicio from "./components/SeleccionServicio";
import ClienteForm from "./components/ClienteForm";
import AdminPanel from "./components/AdminPanel";
import Success from "./components/Success";
import Fail from "./components/Fail";
import PaymentInitiator from "./components/PaymentInitiator";

function App() {
    const [reservedDateTime, setReservedDateTime] = useState(null);
    const [seleccionData, setSeleccionData] = useState(null);
    const [clienteData, setClienteData] = useState(null);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

    const handleReserve = ({ date }) => {
        setReservedDateTime({ date });
        alert(`Turno reservado para el ${date.toDateString()}`);
    };

    const handleSeleccionConfirmada = (data) => {
        console.log("Datos de selección recibidos en App:", data);
        setSeleccionData(data);
        setFechaSeleccionada(null); // Reset fecha when selecting new services
        setClienteData(null); // Reset cliente data when selecting new services
    };

    const handleFechaSeleccionada = (fecha) => {
        console.log("Fecha seleccionada:", fecha);
        setFechaSeleccionada(fecha);
    };

    const handleClienteDataSubmit = (data) => {
        console.log("Datos del cliente recibidos:", data);
        setClienteData(data);
    };

    const handlePagoFinal = () => {
        // Esta función se llamará cuando el usuario quiera proceder al pago
        // después de haber completado el formulario
        // Aquí iría la lógica para iniciar el pago con MercadoPago
        console.log("Iniciando pago con datos:", {
            servicios: seleccionData.servicios,
            fecha: fechaSeleccionada,
            cliente: clienteData
        });
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="main_parent">
                            <SeleccionServicio onSeleccionar={handleSeleccionConfirmada} />

                            {seleccionData && seleccionData.servicios.length > 0 && !fechaSeleccionada && (
                                <CalendarComponent
                                    onFechaSeleccionada={handleFechaSeleccionada}
                                    servicios={seleccionData.servicios}
                                />
                            )}

                            {seleccionData && fechaSeleccionada && !clienteData && (
                                <ClienteForm 
                                    onSubmit={handleClienteDataSubmit} 
                                    servicios={seleccionData.servicios}
                                    total={seleccionData.total}
                                    fecha={fechaSeleccionada}
                                />
                            )}
                            
                            {seleccionData && fechaSeleccionada && clienteData && (
                                <PaymentInitiator 
                                    servicios={seleccionData.servicios}
                                    fecha={fechaSeleccionada}
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