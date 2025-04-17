import { useState, useEffect } from "react";
import "./SeleccionServicio.css";

// Nueva estructura de datos jerárquica
const serviciosDisponibles = [
    {
        nombre: "ploteo",
        categorias: [
            {
                nombre: "auto",
                atributos: [
                    {
                        nombre: "color",
                        opciones: [
                            { nombre: "rojo", descripcion: "Color rojo brillante" },
                            { nombre: "azul", descripcion: "Color azul intenso" },
                            { nombre: "negro", descripcion: "Color negro mate" },
                            { nombre: "blanco", descripcion: "Color blanco perla" },
                            { nombre: "gris grafito", descripcion: "Color gris con acabado mate" },
                        ]
                    }
                ],
                precios: { sml: 1000, med: 1500, lrg: 2000 }
            },
            {
                nombre: "llantas",
                atributos: [
                    {
                        nombre: "color",
                        opciones: [
                            { nombre: "negro", descripcion: "Color negro mate" },
                            { nombre: "gris grafito", descripcion: "Color gris con acabado mate" },
                            { nombre: "dorado", descripcion: "Color dorado metálico" }
                        ]
                    }
                ],
                precios: { sml: 300, med: 400, lrg: 500 }
            },
            {
                nombre: "caliper",
                atributos: [
                    {
                        nombre: "color",
                        opciones: [
                            { nombre: "rojo", descripcion: "Color rojo brillante" },
                            { nombre: "azul", descripcion: "Color azul intenso" },
                            { nombre: "amarillo", descripcion: "Color amarillo intenso" }
                        ]
                    }
                ],
                precios: { sml: 250, med: 300, lrg: 350 }
            },
            {
                nombre: "chrome delete",
                atributos: [],
                precios: { sml: 400, med: 500, lrg: 600 }
            },
            {
                nombre: "insignia",
                atributos: [
                    {
                        nombre: "color",
                        opciones: [
                            { nombre: "negro", descripcion: "Color negro mate" },
                            { nombre: "negro brillante", descripcion: "Color negro con acabado brillante" }
                        ]
                    }
                ],
                precios: { sml: 150, med: 150, lrg: 150 }
            },
            {
                nombre: "parrilla",
                atributos: [
                    {
                        nombre: "color",
                        opciones: [
                            { nombre: "negro", descripcion: "Color negro mate" },
                            { nombre: "negro brillante", descripcion: "Color negro con acabado brillante" }
                        ]
                    }
                ],
                precios: { sml: 300, med: 400, lrg: 500 }
            }
        ]
    },
    {
        nombre: "polarizado",
        categorias: [
            {
                nombre: "estándar",
                atributos: [
                    {
                        nombre: "tono",
                        opciones: [
                            { nombre: "claro", descripcion: "Tono claro, permite mayor paso de luz" },
                            { nombre: "intermedio", descripcion: "Tono medio, equilibrado" },
                            { nombre: "oscuro", descripcion: "Tono oscuro, máxima privacidad" }
                        ]
                    }
                ],
                precios: { sml: 800, med: 1200, lrg: 1600 }
            },
            {
                nombre: "antivandalico",
                atributos: [
                    {
                        nombre: "tono",
                        opciones: [
                            { nombre: "claro", descripcion: "Tono claro, permite mayor paso de luz" },
                            { nombre: "intermedio", descripcion: "Tono medio, equilibrado" },
                            { nombre: "oscuro", descripcion: "Tono oscuro, máxima privacidad" }
                        ]
                    }
                ],
                precios: { sml: 1200, med: 1600, lrg: 2000 }
            }
        ]
    },
    {
        nombre: "abrillantado",
        categorias: [
            {
                nombre: "completo",
                atributos: [],
                precios: { sml: 500, med: 700, lrg: 900 }
            }
        ]
    },
    {
        nombre: "trompa ppf",
        categorias: [
            {
                nombre: "estándar",
                atributos: [],
                precios: { sml: 2000, med: 2500, lrg: 3000 }
            }
        ]
    },
    {
        nombre: "negro simil_vidrio",
        categorias: [
            {
                nombre: "ppf",
                atributos: [
                    {
                        nombre: "zona",
                        opciones: [
                            { nombre: "techo", descripcion: "Aplicación en techo del vehículo" },
                            { nombre: "aleron", descripcion: "Aplicación en alerón" },
                            { nombre: "parantes", descripcion: "Aplicación en parantes" },
                            { nombre: "espejos", descripcion: "Aplicación en espejos laterales" }
                        ]
                    }
                ],
                precios: { sml: 1500, med: 2000, lrg: 2500 }
            },
            {
                nombre: "vinilo",
                atributos: [
                    {
                        nombre: "zona",
                        opciones: [
                            { nombre: "techo", descripcion: "Aplicación en techo del vehículo" },
                            { nombre: "aleron", descripcion: "Aplicación en alerón" },
                            { nombre: "parantes", descripcion: "Aplicación en parantes" },
                            { nombre: "espejos", descripcion: "Aplicación en espejos laterales" }
                        ]
                    }
                ],
                precios: { sml: 1200, med: 1700, lrg: 2200 }
            }
        ]
    }
];

const tiposVehiculo = [
    { id: "chico", nombre: "Auto compacto", tamaño: "sml" },
    { id: "mediano", nombre: "Sedán / Mini SUV", tamaño: "med" },
    { id: "grande", nombre: "SUV / Pickup", tamaño: "lrg" }
];

const SeleccionServicio = ({ onSeleccionar }) => {
    const [tipoVehiculo, setTipoVehiculo] = useState("");
    const [currentView, setCurrentView] = useState('TIPO_VEHICULO');
    const [seleccionActual, setSeleccionActual] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]);
    const [total, setTotal] = useState(0);

    // Actualiza el total cuando cambia la selección
    useEffect(() => {
        if (!tipoVehiculo) {
            setTotal(0);
            return;
        }
        
        const tamaño = tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño;
        if (!tamaño) return;
        
        let nuevoTotal = 0;
        seleccionados.forEach(item => {
            nuevoTotal += item.precio;
        });
        
        setTotal(nuevoTotal);
    }, [seleccionados, tipoVehiculo]);

    // Maneja la navegación entre vistas
    const navigateTo = (view, selection = null) => {
        setCurrentView(view);
        setSeleccionActual(selection);
    };

    // Maneja la selección de un item
    const handleSelection = (item) => {
        const newSelection = {...seleccionActual, ...item};
        
        // Si es selección de vehículo
        if (currentView === 'TIPO_VEHICULO') {
            setTipoVehiculo(item.id);
            // Limpia selecciones anteriores al cambiar de vehículo
            setSeleccionados([]);
            navigateTo('LISTA_SERVICIOS');
            return;
        }
        
        // Si es selección de servicio
        if (currentView === 'LISTA_SERVICIOS') {
            navigateTo('CATEGORIA_SERVICIOS', { servicio: item });
            return;
        }
        
        // Si es selección de categoría
        if (currentView === 'CATEGORIA_SERVICIOS') {
            const tamaño = tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño;
            const categoria = item;
            const servicio = seleccionActual.servicio;
            
            // Si la categoría no tiene atributos, agregar directamente a seleccionados
            if (!categoria.atributos || categoria.atributos.length === 0) {
                const nuevaSeleccion = {
                    id: `${servicio.nombre}-${categoria.nombre}`,
                    servicio: servicio.nombre,
                    categoria: categoria.nombre,
                    precio: categoria.precios[tamaño] || 0,
                    tamaño: tamaño
                };
                
                // Verifica si ya existe para reemplazarlo
                const existeIndex = seleccionados.findIndex(s => s.id === nuevaSeleccion.id);
                if (existeIndex >= 0) {
                    const nuevosSeleccionados = [...seleccionados];
                    nuevosSeleccionados[existeIndex] = nuevaSeleccion;
                    setSeleccionados(nuevosSeleccionados);
                } else {
                    setSeleccionados([...seleccionados, nuevaSeleccion]);
                }
                
                navigateTo('LISTA_SERVICIOS');
                return;
            }
            
            // Si tiene atributos, navegar a la selección de atributos
            navigateTo('ATRIBUTO_CATEGORIA', { 
                servicio: seleccionActual.servicio, 
                categoria: categoria 
            });
            return;
        }
        
        // Si es selección de atributo
        if (currentView === 'ATRIBUTO_CATEGORIA') {
            const atributo = seleccionActual.categoria.atributos[0];
            navigateTo('DETALLE_ATRIBUTO', {
                servicio: seleccionActual.servicio,
                categoria: seleccionActual.categoria,
                atributo: atributo
            });
            return;
        }
        
        // Si es selección de detalle
        if (currentView === 'DETALLE_ATRIBUTO') {
            const tamaño = tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño;
            const opcion = item;
            
            const nuevaSeleccion = {
                id: `${seleccionActual.servicio.nombre}-${seleccionActual.categoria.nombre}`,
                servicio: seleccionActual.servicio.nombre,
                categoria: seleccionActual.categoria.nombre,
                atributo: seleccionActual.atributo.nombre,
                detalle: opcion.nombre,
                descripcion: opcion.descripcion,
                precio: seleccionActual.categoria.precios[tamaño] || 0,
                tamaño: tamaño
            };
            
            // Verifica si ya existe para reemplazarlo
            const existeIndex = seleccionados.findIndex(s => s.id === nuevaSeleccion.id);
            if (existeIndex >= 0) {
                const nuevosSeleccionados = [...seleccionados];
                nuevosSeleccionados[existeIndex] = nuevaSeleccion;
                setSeleccionados(nuevosSeleccionados);
            } else {
                setSeleccionados([...seleccionados, nuevaSeleccion]);
            }
            
            navigateTo('LISTA_SERVICIOS');
            return;
        }
    };

    // Elimina un item de los seleccionados
    const handleRemoveItem = (itemId) => {
        setSeleccionados(seleccionados.filter(item => item.id !== itemId));
    };

    // Envía la selección final
    const handleConfirmar = () => {
        onSeleccionar({ 
            servicios: seleccionados, 
            total,
            tipoVehiculo: tiposVehiculo.find(t => t.id === tipoVehiculo)
        });
    };

    return (
        <div className="seleccion-servicio-container">
            <div className={`steps-wrapper view-${currentView}`}>

                {/* Vista Tipo de Vehículo */}
                <div className="step step-TIPO_VEHICULO">
                    <h2>1. Elegí tu tipo de vehículo</h2>
                    <ul className="selection-list vehicle-list">
                        {tiposVehiculo.map((vehiculo) => (
                            <li 
                                key={vehiculo.id}
                                className={`selection-item ${tipoVehiculo === vehiculo.id ? 'selected' : ''}`}
                                onClick={() => handleSelection(vehiculo)}
                            >
                                <span className="item-name">{vehiculo.nombre}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Vista Lista de Servicios */}
                <div className="step step-LISTA_SERVICIOS">
                    {tipoVehiculo && (
                        <>
                            <button onClick={() => navigateTo('TIPO_VEHICULO')} className="back-button">← Cambiar Vehículo</button>
                            <h2>2. Seleccioná los servicios</h2>
                            <ul className="selection-list service-list">
                                {serviciosDisponibles.map((servicio) => (
                                    <li 
                                        key={servicio.nombre}
                                        className="selection-item"
                                        onClick={() => handleSelection(servicio)}
                                    >
                                        <span className="item-name">{servicio.nombre}</span>
                                        <span className="item-arrow">→</span>
                                    </li>
                                ))}
                            </ul>
                            
                            {/* Resumen de selecciones */}
                            {seleccionados.length > 0 && (
                                <div className="selections-summary">
                                    <h3>Servicios seleccionados:</h3>
                                    <ul className="selected-items">
                                        {seleccionados.map((item) => (
                                            <li key={item.id} className="selected-item">
                                                <div className="selected-item-details">
                                                    <div className="selected-item-name">
                                                        <strong>{item.servicio}</strong> - {item.categoria}
                                                        {item.detalle && `: ${item.detalle}`}
                                                    </div>
                                                    <span className="selected-item-price">${item.precio}</span>
                                                </div>
                                                <button 
                                                    className="remove-item" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveItem(item.id);
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="total-section">
                                <h3>Total: ${total}</h3>
                                <button
                                    onClick={handleConfirmar}
                                    disabled={seleccionados.length === 0}
                                    className="confirm-button"
                                >
                                    Confirmar selección
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Vista Categorías de Servicios */}
                <div className="step step-CATEGORIA_SERVICIOS">
                    {seleccionActual?.servicio && (
                        <>
                            <button onClick={() => navigateTo('LISTA_SERVICIOS')} className="back-button">← Volver a Servicios</button>
                            <h2>Categorías de {seleccionActual.servicio.nombre}</h2>
                            <ul className="selection-list category-list">
                                {seleccionActual.servicio.categorias.map((categoria) => (
                                    <li 
                                        key={categoria.nombre}
                                        className="selection-item"
                                        onClick={() => handleSelection(categoria)}
                                    >
                                        <span className="item-name">{categoria.nombre}</span>
                                        <span className="item-price">
                                            ${categoria.precios[tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño] || 0}
                                        </span>
                                        {categoria.atributos && categoria.atributos.length > 0 && (
                                            <span className="item-arrow">→</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* Vista Atributos de Categoría */}
                <div className="step step-ATRIBUTO_CATEGORIA">
                    {seleccionActual?.categoria && (
                        <>
                            <button onClick={() => navigateTo('CATEGORIA_SERVICIOS', { servicio: seleccionActual.servicio })} className="back-button">← Volver a Categorías</button>
                            <h2>Atributos para {seleccionActual.categoria.nombre}</h2>
                            <ul className="selection-list attribute-list">
                                {seleccionActual.categoria.atributos.map((atributo) => (
                                    <li 
                                        key={atributo.nombre}
                                        className="selection-item"
                                        onClick={() => handleSelection(atributo)}
                                    >
                                        <span className="item-name">{atributo.nombre}</span>
                                        <span className="item-arrow">→</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* Vista Detalles de Atributo */}
                <div className="step step-DETALLE_ATRIBUTO">
                    {seleccionActual?.atributo && (
                        <>
                            <button onClick={() => navigateTo('ATRIBUTO_CATEGORIA', { servicio: seleccionActual.servicio, categoria: seleccionActual.categoria })} className="back-button">← Volver a Atributos</button>
                            <h2>Opciones para {seleccionActual.atributo.nombre}</h2>
                            <ul className="selection-list detail-list">
                                {seleccionActual.atributo.opciones.map((opcion) => (
                                    <li 
                                        key={opcion.nombre}
                                        className="selection-item"
                                        onClick={() => handleSelection(opcion)}
                                    >
                                        <div className="option-details">
                                            <span className="item-name">{opcion.nombre}</span>
                                            <span className="item-description">{opcion.descripcion}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SeleccionServicio;