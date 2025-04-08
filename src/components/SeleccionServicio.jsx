import { useState } from "react";

const mapTipoVehiculoATamaño = {
	chico: "sml",
	mediano: "med",
	grande: "lrg"
};

const opcionesAtributos = {
	color: ["rojo", "azul", "negro", "blanco", "gris"],
	tono: ["claro", "intermedio", "oscuro"],
	tipo: ["estándar", "antivandalico"],
	subtipo: ["ppf", "vinilo"],
	zona: ["techo", "aleron", "parantes", "espejos"]
};

const serviciosDisponibles = [
	{ nombre: "ploteo", subtipo: "auto", atributos: ["color"] },
	{ nombre: "polarizado", atributos: ["tono", "tipo"] },
	{ nombre: "abrillantado", atributos: [] },
	{ nombre: "trompa ppf", atributos: [] },
	{ nombre: "negro simil_vidrio", atributos: ["subtipo", "zona"] }
];

const SeleccionServicio = ({ onSeleccionar }) => {
	const [tipoVehiculo, setTipoVehiculo] = useState("");
	const [seleccionados, setSeleccionados] = useState([]);
	const [detalles, setDetalles] = useState({});

	const toggleServicio = (servicio) => {
		setSeleccionados((prev) =>
			prev.includes(servicio)
				? prev.filter((s) => s !== servicio)
				: [...prev, servicio]
		);
	};

	const handleChangeAtributo = (servicio, atributo, valor) => {
		setDetalles((prev) => ({
			...prev,
			[servicio]: {
				...prev[servicio],
				[atributo]: valor
			}
		}));
	};

	const handleEnviar = () => {
		const tamañoAuto = mapTipoVehiculoATamaño[tipoVehiculo];
		const seleccionFinal = seleccionados.map((nombre) => {
			const base = { nombre };
			const atributos = detalles[nombre] || {};
			return { ...base, ...atributos, tamaño: tamañoAuto };
		});
		onSeleccionar(seleccionFinal);
	};

	return (
		<div>
			<h2>Elegí tu tipo de vehículo</h2>
			<select value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value)}>
				<option value="">-- Seleccioná --</option>
				<option value="chico">Auto compacto</option>
				<option value="mediano">Sedán / Mini SUV</option>
				<option value="grande">SUV / Pickup</option>
			</select>

			{tipoVehiculo && (
				<>
					<h3>Seleccioná los servicios</h3>
					<ul>
						{serviciosDisponibles.map((s) => (
							<li key={s.nombre} style={{ marginBottom: "10px" }}>
								<label>
									<input
										type="checkbox"
										checked={seleccionados.includes(s.nombre)}
										onChange={() => toggleServicio(s.nombre)}
									/>{" "}
									{s.nombre} {s.subtipo && `(${s.subtipo})`}
								</label>

								{seleccionados.includes(s.nombre) && (
									<div style={{ marginTop: "5px", marginLeft: "20px" }}>
										{s.atributos.map((attr) => (
											<div key={attr}>
												<label>
													{attr}:{" "}
													<select
														value={detalles[s.nombre]?.[attr] || ""}
														onChange={(e) =>
															handleChangeAtributo(s.nombre, attr, e.target.value)
														}
													>
														<option value="">-- Seleccionar --</option>
														{(opcionesAtributos[attr] || []).map((op) => (
															<option key={op} value={op}>
																{op}
															</option>
														))}
													</select>
												</label>
											</div>
										))}
									</div>
								)}
							</li>
						))}
					</ul>
					<button onClick={handleEnviar}>Confirmar selección</button>
				</>
			)}
		</div>
	);
};

export default SeleccionServicio;
