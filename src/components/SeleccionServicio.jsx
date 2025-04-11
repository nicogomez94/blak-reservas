import { useState, useEffect } from "react";
import "./SeleccionServicio.css";

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
    const [currentView, setCurrentView] = useState('TIPO_VEHICULO');
    const [servicioEnEdicion, setServicioEnEdicion] = useState(null);

    useEffect(() => {
        if (!tipoVehiculo) {
            setTotal(0);
            return;
        }
        const tamañoAuto = mapTipoVehiculoATamaño[tipoVehiculo];
        let nuevoTotal = 0;
        seleccionados.forEach((nombreServicio) => {
            const servicio = serviciosDisponibles.find((s) => s.nombre === nombreServicio);
            if (servicio && servicio.precios[tamañoAuto]) {
                nuevoTotal += servicio.precios[tamañoAuto];
            }
        });
        setTotal(nuevoTotal);
    }, [seleccionados, tipoVehiculo]);

    const handleTipoVehiculoChange = (e) => {
        const nuevoTipo = e.target.value;
        setTipoVehiculo(nuevoTipo);
        if (nuevoTipo) {
            setCurrentView('LISTA_SERVICIOS');
        } else {
            setCurrentView('TIPO_VEHICULO');
            setSeleccionados([]);
            setDetalles({});
        }
    };

    const toggleServicio = (nombreServicio) => {
        setSeleccionados((prev) => {
            const isSelected = prev.includes(nombreServicio);
            let newSeleccionados;
            if (isSelected) {
                newSeleccionados = prev.filter((s) => s !== nombreServicio);
                setDetalles(prevDetalles => {
                    const updatedDetalles = {...prevDetalles};
                    delete updatedDetalles[nombreServicio];
                    return updatedDetalles;
                });
                 if(servicioEnEdicion === nombreServicio) {
                    setServicioEnEdicion(null);
                    setCurrentView('LISTA_SERVICIOS');
                }
            } else {
                newSeleccionados = [...prev, nombreServicio];
            }
            return newSeleccionados;
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

    const handleVerDetalles = (nombreServicio) => {
        setServicioEnEdicion(nombreServicio);
        setCurrentView('DETALLES_SERVICIO');
    };

    const handleVolverALista = () => {
        setServicioEnEdicion(null);
        setCurrentView('LISTA_SERVICIOS');
    };

    useEffect(() => {
        setSeleccionados([]);
        setDetalles({});
        setServicioEnEdicion(null);
    }, [tipoVehiculo]);

    const handleEnviar = () => {
        const tamañoAuto = mapTipoVehiculoATamaño[tipoVehiculo];
        const seleccionFinal = seleccionados.map((nombre) => {
            const base = { nombre };
            const atributos = detalles[nombre] || {};
            const precioIndividual = serviciosDisponibles.find((s) => s.nombre === nombre)?.precios[tamañoAuto] || 0;
            return { ...base, ...atributos, tamaño: tamañoAuto, precio: precioIndividual };
        });
        onSeleccionar({ servicios: seleccionFinal, total });
    };

     const areAllAttributesSelected = () => {
         return seleccionados.every((nombre) => {
             const servicio = serviciosDisponibles.find((s) => s.nombre === nombre);
             if (!servicio || servicio.atributos.length === 0) return true;
             return servicio.atributos.every((attr) => detalles[nombre]?.[attr]);
         });
     };

    return (
        <div className="seleccion-servicio-container">
            <div className={`steps-wrapper view-${currentView}`}>

                <div className="step step-TIPO_VEHICULO">
                    <h2>1. Elegí tu tipo de vehículo</h2>
                    <select value={tipoVehiculo} onChange={handleTipoVehiculoChange}>
                        <option value="">-- Seleccioná --</option>
                        <option value="chico">Auto compacto</option>
                        <option value="mediano">Sedán / Mini SUV</option>
                        <option value="grande">SUV / Pickup</option>
                    </select>
                </div>

                <div className="step step-LISTA_SERVICIOS">
                    {tipoVehiculo && (
                        <>
                            <button onClick={() => setCurrentView('TIPO_VEHICULO')} className="back-button">← Cambiar Vehículo</button>
                            <h2>2. Seleccioná los servicios</h2>
                            <ul className="service-list">
                                {serviciosDisponibles.map((s) => {
                                    const isSelected = seleccionados.includes(s.nombre);
                                    const hasAttributes = s.atributos.length > 0;
                                    const tamañoKey = mapTipoVehiculoATamaño[tipoVehiculo];
                                    const precio = s.precios[tamañoKey] || 0;
                                    const atributosCompletos = !hasAttributes || (detalles[s.nombre] && s.atributos.every(attr => detalles[s.nombre]?.[attr]));

                                    return (
                                        <li key={s.nombre} className={`service-item ${isSelected ? 'selected' : ''}`}>
                                            <label className="service-label">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleServicio(s.nombre)}
                                                />
                                                <div className="service-info">
                                                    <span>{s.nombre} {s.subtipo && `(${s.subtipo})`}</span>
                                                    <span className="service-price">${precio}</span>
                                                </div>
                                            </label>
                                            {isSelected && hasAttributes && (
                                                <button
                                                    onClick={() => handleVerDetalles(s.nombre)}
                                                    className={`details-button ${!atributosCompletos ? 'incomplete' : ''}`}
                                                    title={!atributosCompletos ? "Completar detalles" : "Ver/Editar detalles"}
                                                >
                                                    {atributosCompletos ? 'Editar Detalles' : 'Completar Detalles'}
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="total-section">
                                <h3>Total: ${total}</h3>
                                <button
                                    onClick={handleEnviar}
                                    disabled={seleccionados.length === 0 || !areAllAttributesSelected()}
                                    className="confirm-button"
                                    style={{marginLeft: "0"}}
                                >
                                    Confirmar selección
                                </button>
                             </div>
                        </>
                    )}
                </div>

                 <div className="step step-DETALLES_SERVICIO">
                    {servicioEnEdicion && (() => {
                        const servicioActual = serviciosDisponibles.find(s => s.nombre === servicioEnEdicion);
                        if (!servicioActual) return null;

                        return (
                            <>
                                <button onClick={handleVolverALista} className="back-button">← Volver a Servicios</button>
                                <h2>Detalles para: {servicioActual.nombre}</h2>
                                <div className="attribute-list">
                                    {servicioActual.atributos.map((attr) => (
                                        <div key={attr} className="attribute-item">
                                            <label>
                                                {attr}:
                                                <select
                                                    value={detalles[servicioActual.nombre]?.[attr] || ""}
                                                    onChange={(e) =>
                                                        handleChangeAtributo(servicioActual.nombre, attr, e.target.value)
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
                                <button onClick={handleVolverALista} className="done-button">Listo</button>
                            </>
                        );
                    })()}
                 </div>

            </div>
        </div>
    );
};

export default SeleccionServicio;