import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalendarComponent from "./components/CalendarComponent";
import AdminPanel from "./components/AdminPanel";

function App() {
	const [reservedDateTime, setReservedDateTime] = useState(null);

	const handleReserve = ({ date, time }) => {
		setReservedDateTime({ date, time });
		alert(`Turno reservado para el ${date.toDateString()} a las ${time} hs`);
	};

	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={
						<div>
							<h1>Reserva tu turno en BLAK COCK</h1>
							<CalendarComponent onReserve={handleReserve} />

							{reservedDateTime && (
								<p
									style={{
										marginTop: "20px",
										fontWeight: "bold",
										color: "green"
									}}
								>
									Turno confirmado para el {reservedDateTime.date.toDateString()} a las {reservedDateTime.time} hs
								</p>
							)}
						</div>
					}
				/>
				<Route path="/admin" element={<AdminPanel />} />
			</Routes>
		</Router>
	);
}

export default App;
