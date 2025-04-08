import { useState, useEffect } from "react";

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
    { nombre: "ploteo", subtipo: "auto", atributos: ["color"], precios: { sml: 1000, med: 1500, lrg: 2000 } },
    { nombre: "polarizado", atributos: ["tono", "tipo"], precios: { sml: 800, med: 1200, lrg: 1600 } },
    { nombre: "abrillantado", atributos: [], precios: { sml: 500, med: 700, lrg: 900 } },
    { nombre: "trompa ppf", atributos: [], precios: { sml: 2000, med: 2500, lrg: 3000 } },
    { nombre: "negro simil_vidrio", atributos: ["subtipo", "zona"], precios: { sml: 1500, med: 2000, lrg: 2500 } },
];

const SeleccionServicio = ({ onSeleccionar }) => {
    const [tipoVehiculo, setTipoVehiculo] = useState("");
    const [seleccionados, setSeleccionados] = useState([]);
    const [detalles, setDetalles] = useState({});
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!tipoVehiculo) {
            setTotal(0);
            return;
        }

        const tamañoAuto = mapTipoVehiculoATamaño[tipoVehiculo];
        let nuevoTotal = 0;

        seleccionados.forEach(nombreServicio => {
            const servicio = serviciosDisponibles.find(s => s.nombre === nombreServicio);
            if (servicio && servicio.precios[tamañoAuto]) {
                nuevoTotal += servicio.precios[tamañoAuto];
            }
        });

        setTotal(nuevoTotal);

    }, [seleccionados, tipoVehiculo]); // Dependencias: se ejecuta si cambia seleccionados o tipoVehiculo

    const toggleServicio = (servicio) => {
        setSeleccionados((prev) => {
            const isSelected = prev.includes(servicio);
            return isSelected
                ? prev.filter((s) => s !== servicio)
                : [...prev, servicio];
        });
    };

    const handleChangeAtributo = (servicio, atributo, valor) => {
        setDetalles((prev) => ({
            ...prev,
            [servicio]: {
                ...prev[servicio],
                [atributo]: valor,
            },
        }));
    };

    useEffect(() => {
        setSeleccionados([]);
        setDetalles({});
    }, [tipoVehiculo]);


    const handleEnviar = () => {
        const tamañoAuto = mapTipoVehiculoATamaño[tipoVehiculo];
        const seleccionFinal = seleccionados.map((nombre) => {
            const base = { nombre };
            const atributos = detalles[nombre] || {};
            const precioIndividual = serviciosDisponibles.find((s) => s.nombre === nombre)?.precios[tamañoAuto] || 0;
            return { ...base, ...atributos, tamaño: tamañoAuto, precio: precioIndividual }; // Usamos precioIndividual aquí
        });
        onSeleccionar({ servicios: seleccionFinal, total });
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
                                    {s.nombre} {s.subtipo && `(${s.subtipo})`} - $
                                    {s.precios[mapTipoVehiculoATamaño[tipoVehiculo]]}
                                </label>

                                {seleccionados.includes(s.nombre) && s.atributos.length > 0 && ( // Solo muestra si hay atributos
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
                    <h3>Total: ${total}</h3>
                    <button onClick={handleEnviar} disabled={seleccionados.length === 0}> {/* Opcional: deshabilitar si no hay nada */}
                        Confirmar selección
                    </button>
                </>
            )}
        </div>
    );
};

export default SeleccionServicio;