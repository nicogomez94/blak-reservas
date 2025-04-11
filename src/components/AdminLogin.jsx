import { useState } from "react";

const AdminLogin = ({ onLogin }) => {
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (password === "123") {
			onLogin();
		} else {
			setError("Contraseña incorrecta");
		}
	};

	return (
		<div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
			<h2>Acceso de administrador</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="password"
					placeholder="Contraseña"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					style={{ padding: "8px", width: "100%" }}
				/>
				<button style={{ marginTop: "10px" }}>Ingresar</button>
			</form>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
};

export default AdminLogin;