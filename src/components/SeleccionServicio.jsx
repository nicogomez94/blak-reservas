const servicios = [
	{ id: "chico", label: "PLOTEO CHICO $249.000 - AUTO COMPACTO", precio: 10 },
	{ id: "mediano", label: "PLOTEO MEDIANO $299.000 - SEDÁN, MINI SUV O UTILITARIA", precio: 10 },
	{ id: "grande", label: "PLOTEO GRANDE $399.000 - SUV O PICK-UP", precio: 10 }
];

const SeleccionServicio = ({ onSeleccionar }) => {
	return (
		<div style={{ padding: "20px" }}>
			<h2>Elegí tu servicio</h2>
			<ul style={{ listStyle: "none", padding: 0 }}>
				{servicios.map((serv) => (
					<li key={serv.id} style={{ marginBottom: "15px" }}>
						<button
							style={{ padding: "10px 20px", width: "100%" }}
							onClick={() => onSeleccionar(serv)}
						>
							{serv.label}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default SeleccionServicio;
