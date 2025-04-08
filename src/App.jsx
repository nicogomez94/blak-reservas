import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalendarComponent from "./components/CalendarComponent";
import SeleccionServicio from "./components/SeleccionServicio";
import AdminPanel from "./components/AdminPanel";
import Success from "./components/Success";
import Fail from "./components/Fail";

function App() {
	const [reservedDateTime, setReservedDateTime] = useState(null);
	const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

	const handleReserve = ({ date }) => {
		setReservedDateTime({ date });
		alert(`Turno reservado para el ${date.toDateString()}`);
	};

	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={
						<div>
							<h1 className="main_h">Reserva tu turno en BLAK</h1>

							<SeleccionServicio onSeleccionar={setServiciosSeleccionados} />

							{serviciosSeleccionados.length > 0 && (
								<CalendarComponent
									onReserve={handleReserve}
									servicios={serviciosSeleccionados}
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