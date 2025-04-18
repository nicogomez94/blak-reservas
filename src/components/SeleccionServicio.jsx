import { useState, useEffect } from "react";
import "./SeleccionServicio.css";

// Nueva estructura reorganizada de servicios disponibles
const serviciosDisponibles = [
    {
        nombre: "Pintura auto completo",
        tipo: "pintura",
        opciones: [
            { nombre: "rojo", descripcion: "Color rojo brillante" },
            { nombre: "azul", descripcion: "Color azul intenso" },
            { nombre: "negro", descripcion: "Color negro mate" },
            { nombre: "blanco", descripcion: "Color blanco perla" },
            { nombre: "gris grafito", descripcion: "Color gris con acabado mate" }
        ],
        precios: { sml: 1000, med: 1500, lrg: 2000 }
    },
    {
        nombre: "Pintura llantas",
        tipo: "pintura",
        opciones: [
            { nombre: "negro", descripcion: "Color negro mate" },
            { nombre: "gris grafito", descripcion: "Color gris con acabado mate" },
            { nombre: "dorado", descripcion: "Color dorado metálico" }
        ],
        precios: { sml: 300, med: 400, lrg: 500 }
    },
    {
        nombre: "Pintura calipers",
        tipo: "pintura",
        opciones: [
            { nombre: "rojo", descripcion: "Color rojo brillante" },
            { nombre: "azul", descripcion: "Color azul intenso" },
            { nombre: "amarillo", descripcion: "Color amarillo intenso" }
        ],
        precios: { sml: 250, med: 300, lrg: 350 }
    },
    {
        nombre: "Cromados a negro",
        tipo: "simple",
        descripcion: "Transformación de elementos cromados a acabado negro",
        precios: { sml: 400, med: 500, lrg: 600 }
    },
    {
        nombre: "Fumé ópticas",
        tipo: "simple",
        descripcion: "Oscurecimiento de faros con acabado profesional",
        precios: { sml: 350, med: 450, lrg: 550 }
    },
    {
        nombre: "Pulido ópticas",
        tipo: "simple",
        descripcion: "Pulido y restauración de transparencia en faros",
        precios: { sml: 300, med: 400, lrg: 500 }
    },
    {
        nombre: "Polarizado",
        tipo: "complejo",
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
    }
];

const tiposVehiculo = [
    { 
        id: "chico", 
        nombre: "Auto compacto", 
        tamaño: "sml",
        imagen: "2",
        descripcion: "Clio, Chery QQ, Kwid, Fiat 500, VW Up, Fiat Uno"
    },
    { 
        id: "mediano", 
        nombre: "Sedán / Mini SUV", 
        tamaño: "med",
        imagen: "2",
        descripcion: "Toyota Hilux, Ford Ranger, Jeep Compass, Nissan X-Trail, Chevrolet Tracker"
     },
    { 
        id: "grande", 
        nombre: "SUV / Pickup", 
        tamaño: "lrg",
        imagen: "2",
        descripcion: "Toyota Hilux, Ford Ranger, Jeep Compass, Nissan X-Trail, Chevrolet Tracker"
    }
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
            nuevoTotal += item.precio || 0;
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
            const servicio = item;
            
            switch(servicio.tipo) {
                case 'pintura':
                    // Para servicios de pintura, ir directo a selección de colores
                    navigateTo('DETALLE_COLOR', { servicio: servicio });
                    break;
                    
                case 'simple':
                    // Para servicios simples, ir a confirmación directa
                    navigateTo('CONFIRMACION_SIMPLE', { servicio: servicio });
                    break;
                    
                case 'complejo':
                    // Para servicios complejos (como polarizado), mantener flujo original
                    navigateTo('CATEGORIA_SERVICIOS', { servicio: servicio });
                    break;
                    
                default:
                    navigateTo('LISTA_SERVICIOS');
            }
            return;
        }
        
        // Si es selección de categoría (solo para servicios complejos)
        if (currentView === 'CATEGORIA_SERVICIOS') {
            if (!seleccionActual?.servicio) {
                console.error("Servicio no definido en selección de categoría");
                navigateTo('LISTA_SERVICIOS');
                return;
            }

            const tamaño = tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño || 'med';
            const categoria = item;
            const servicio = seleccionActual.servicio;
            
            // Si la categoría no tiene atributos, agregar directamente a seleccionados
            if (!categoria.atributos || categoria.atributos.length === 0) {
                const nuevaSeleccion = {
                    id: `${servicio.nombre}-${categoria.nombre}`,
                    servicio: servicio.nombre,
                    categoria: categoria.nombre,
                    precio: categoria.precios?.[tamaño] || 0,
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
            if (!seleccionActual?.categoria?.atributos || seleccionActual.categoria.atributos.length === 0) {
                console.error("No hay atributos definidos");
                navigateTo('CATEGORIA_SERVICIOS', { servicio: seleccionActual?.servicio });
                return;
            }

            const atributo = seleccionActual.categoria.atributos[0];
            navigateTo('DETALLE_ATRIBUTO', {
                servicio: seleccionActual.servicio,
                categoria: seleccionActual.categoria,
                atributo: atributo
            });
            return;
        }
        
        // Si es selección de detalle de color (para servicios tipo pintura)
        if (currentView === 'DETALLE_COLOR') {
            if (!seleccionActual?.servicio) {
                console.error("Servicio no definido en selección de color");
                navigateTo('LISTA_SERVICIOS');
                return;
            }

            const opcion = item;
            navigateTo('CONFIRMACION_COLOR', {
                servicio: seleccionActual.servicio,
                opcion: opcion
            });
            return;
        }
        
        // Si es selección de detalle (para servicios complejos)
        if (currentView === 'DETALLE_ATRIBUTO') {
            if (!seleccionActual?.servicio || !seleccionActual?.categoria || !seleccionActual?.atributo) {
                console.error("Datos incompletos en selección de detalle");
                navigateTo('LISTA_SERVICIOS');
                return;
            }

            const opcion = item;
            navigateTo('CONFIRMACION_DETALLE', {
                servicio: seleccionActual.servicio,
                categoria: seleccionActual.categoria,
                atributo: seleccionActual.atributo,
                opcion: opcion
            });
            return;
        }
        
        // Si es confirmación de detalle de color
        if (currentView === 'CONFIRMACION_COLOR') {
            if (!seleccionActual?.servicio || !seleccionActual?.opcion) {
                console.error("Datos incompletos para agregar selección de color", seleccionActual);
                navigateTo('LISTA_SERVICIOS');
                return;
            }

            const tamaño = tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño || 'med';
            const precio = seleccionActual.servicio.precios?.[tamaño] || 0;
            
            const nuevaSeleccion = {
                id: `${seleccionActual.servicio.nombre}`,
                servicio: seleccionActual.servicio.nombre,
                detalle: seleccionActual.opcion.nombre,
                descripcion: seleccionActual.opcion.descripcion,
                precio: precio,
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
        
        // Si es confirmación de servicio simple
        if (currentView === 'CONFIRMACION_SIMPLE') {
            if (!seleccionActual?.servicio) {
                console.error("Datos incompletos para agregar servicio simple", seleccionActual);
                navigateTo('LISTA_SERVICIOS');
                return;
            }

            const tamaño = tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño || 'med';
            const precio = seleccionActual.servicio.precios?.[tamaño] || 0;
            
            const nuevaSeleccion = {
                id: `${seleccionActual.servicio.nombre}`,
                servicio: seleccionActual.servicio.nombre,
                descripcion: seleccionActual.servicio.descripcion,
                precio: precio,
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
        
        // Confirmación de detalle (para servicios complejos)
        if (currentView === 'CONFIRMACION_DETALLE') {
            if (!seleccionActual?.servicio || !seleccionActual?.categoria || 
                !seleccionActual?.atributo || !seleccionActual?.opcion) {
                console.error("Datos incompletos para agregar selección", seleccionActual);
                navigateTo('LISTA_SERVICIOS');
                return;
            }

            const tamaño = tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño || 'med';
            const precio = seleccionActual.categoria.precios?.[tamaño] || 0;
            
            const nuevaSeleccion = {
                id: `${seleccionActual.servicio.nombre}-${seleccionActual.categoria.nombre}`,
                servicio: seleccionActual.servicio.nombre,
                categoria: seleccionActual.categoria.nombre,
                atributo: seleccionActual.atributo.nombre,
                detalle: seleccionActual.opcion.nombre,
                descripcion: seleccionActual.opcion.descripcion,
                precio: precio,
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
                                <span className="item-img">
                                    <img 
                                        src={`../../public/APP/servicio/${vehiculo.imagen}.png`} 
                                        alt={`Imagen de ${vehiculo.nombre}`} 
                                        className="vehicle-image" 
                                    />
                                </span>
                                <span className="item-descr">{`${vehiculo.descripcion}`}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Vista Lista de Servicios */}
                <div className="step step-LISTA_SERVICIOS">
                    {tipoVehiculo && (
                        <>
                            <h2>2. Seleccioná los servicios</h2>
                            <button onClick={() => navigateTo('TIPO_VEHICULO')} className="back-button">← Cambiar Vehículo</button>
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
                                                        <strong>{item.servicio}</strong>
                                                        {item.categoria && ` - ${item.categoria}`}
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

                {/* Vista Categorías de Servicios (para servicios complejos) */}
                <div className="step step-CATEGORIA_SERVICIOS">
                    {seleccionActual?.servicio && seleccionActual.servicio.tipo === 'complejo' && (
                        <>
                            <button onClick={() => navigateTo('LISTA_SERVICIOS')} className="back-button">← Volver a Servicios</button>
                            <h2>Categorías de {seleccionActual.servicio.nombre}</h2>
                            <ul className="selection-list category-list">
                                {seleccionActual.servicio.categorias?.map((categoria) => (
                                    <li 
                                        key={categoria.nombre}
                                        className="selection-item"
                                        onClick={() => handleSelection(categoria)}
                                    >
                                        <span className="item-name">{categoria.nombre}</span>
                                        <span className="item-price">
                                            ${categoria.precios?.[tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño] || 0}
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

                {/* Vista Atributos de Categoría (para servicios complejos) */}
                <div className="step step-ATRIBUTO_CATEGORIA">
                    {seleccionActual?.categoria && (
                        <>
                            <button onClick={() => navigateTo('CATEGORIA_SERVICIOS', { servicio: seleccionActual.servicio })} className="back-button">← Volver a Categorías</button>
                            <h2>Atributos para {seleccionActual.categoria.nombre}</h2>
                            <ul className="selection-list attribute-list">
                                {seleccionActual.categoria.atributos?.map((atributo) => (
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

                {/* Vista Detalles de Atributo (para servicios complejos) */}
                <div className="step step-DETALLE_ATRIBUTO">
                    {seleccionActual?.atributo && (
                        <>
                            <button onClick={() => navigateTo('ATRIBUTO_CATEGORIA', { servicio: seleccionActual.servicio, categoria: seleccionActual.categoria })} className="back-button">← Volver a Atributos</button>
                            <h2>Opciones para {seleccionActual.atributo.nombre}</h2>
                            <ul className="selection-list detail-list">
                                {seleccionActual.atributo.opciones?.map((opcion) => (
                                    <li 
                                        key={opcion.nombre}
                                        className="selection-item"
                                        onClick={() => handleSelection(opcion)}
                                    >
                                        <div className="option-details">
                                            <span className="item-name">{opcion.nombre}</span>
                                            <span className="item-description">{opcion.descripcion}</span>
                                        </div>
                                        {seleccionActual.atributo.nombre === 'tono' && (
                                            <div 
                                                className="color-preview"
                                                style={{
                                                    backgroundColor: getColorCode(opcion.nombre),
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '50%'
                                                }}
                                            />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* Nueva Vista: Detalle de Color (para servicios de pintura) */}
                <div className="step step-DETALLE_COLOR">
                    {seleccionActual?.servicio && seleccionActual.servicio.tipo === 'pintura' && (
                        <>
                            <button onClick={() => navigateTo('LISTA_SERVICIOS')} className="back-button">
                                ← Volver a Servicios
                            </button>
                            <h2>Selecciona color para {seleccionActual.servicio.nombre}</h2>
                            <ul className="selection-list detail-list">
                                {seleccionActual.servicio.opciones?.map((opcion) => (
                                    <li 
                                        key={opcion.nombre}
                                        className="selection-item"
                                        onClick={() => handleSelection(opcion)}
                                    >
                                        <div className="option-details">
                                            <span className="item-name">{opcion.nombre}</span>
                                            <span className="item-description">{opcion.descripcion}</span>
                                        </div>
                                        <div 
                                            className="color-preview"
                                            style={{
                                                backgroundColor: getColorCode(opcion.nombre),
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%'
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
                
                {/* Nueva Vista: Confirmación de Color */}
                <div className="step step-CONFIRMACION_COLOR">
                    {seleccionActual?.servicio && seleccionActual?.opcion && (
                        <>
                            <button 
                                onClick={() => navigateTo('DETALLE_COLOR', { 
                                    servicio: seleccionActual.servicio
                                })} 
                                className="back-button"
                            >
                                ← Volver a Colores
                            </button>
                            <h2>Confirmar selección</h2>
                            
                            <div className="confirmation-details">
                                <div className="selection-preview">
                                    <div className="preview-image">
                                        <div 
                                            className="color-sample" 
                                            style={{ 
                                                backgroundColor: getColorCode(seleccionActual.opcion.nombre),
                                                width: '100%',
                                                height: '160px',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="selected-details">
                                        <h3>{seleccionActual.servicio.nombre}</h3>
                                        <p>
                                            <strong>Color:</strong> {seleccionActual.opcion.nombre}
                                        </p>
                                        <p className="detail-description">{seleccionActual.opcion.descripcion}</p>
                                        
                                        <p className="price-detail">
                                            <strong>Precio:</strong> $
                                            {seleccionActual.servicio.precios?.[
                                                tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño
                                            ] || 0}
                                        </p>
                                    </div>
                                </div>
                                
                                <button 
                                    className="add-button"
                                    onClick={() => handleSelection({})}
                                >
                                    Agregar a mi selección
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Nueva Vista: Confirmación Simple */}
                <div className="step step-CONFIRMACION_SIMPLE">
                    {seleccionActual?.servicio && seleccionActual.servicio.tipo === 'simple' && (
                        <>
                            <button onClick={() => navigateTo('LISTA_SERVICIOS')} className="back-button">
                                ← Volver a Servicios
                            </button>
                            <h2>Confirmar servicio</h2>
                            
                            <div className="confirmation-details">
                                <div className="selection-preview">
                                    <div className="selected-details">
                                        <h3>{seleccionActual.servicio.nombre}</h3>
                                        <p className="detail-description">{seleccionActual.servicio.descripcion}</p>
                                        
                                        <p className="price-detail">
                                            <strong>Precio:</strong> $
                                            {seleccionActual.servicio.precios?.[
                                                tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño
                                            ] || 0}
                                        </p>
                                    </div>
                                </div>
                                
                                <button 
                                    className="add-button"
                                    onClick={() => handleSelection({})}
                                >
                                    Agregar a mi selección
                                </button>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Vista Confirmación de Detalles (para servicios complejos) */}
                <div className="step step-CONFIRMACION_DETALLE">
                    {seleccionActual?.opcion && seleccionActual?.servicio?.tipo === 'complejo' && (
                        <>
                            <button 
                                onClick={() => navigateTo('DETALLE_ATRIBUTO', { 
                                    servicio: seleccionActual.servicio, 
                                    categoria: seleccionActual.categoria,
                                    atributo: seleccionActual.atributo
                                })} 
                                className="back-button"
                            >
                                ← Volver a Opciones
                            </button>
                            <h2>Confirmar selección</h2>
                            
                            <div className="confirmation-details">
                                <div className="selection-preview">
                                    <div className="preview-image">
                                        {seleccionActual.atributo?.nombre === 'tono' && (
                                            <div 
                                                className="color-sample" 
                                                style={{ 
                                                    backgroundColor: getColorCode(seleccionActual.opcion.nombre),
                                                    width: '100%',
                                                    height: '160px',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="selected-details">
                                        <h3>{seleccionActual.servicio.nombre} - {seleccionActual.categoria.nombre}</h3>
                                        <p>
                                            <strong>{seleccionActual.atributo.nombre}:</strong> {seleccionActual.opcion.nombre}
                                        </p>
                                        <p className="detail-description">{seleccionActual.opcion.descripcion}</p>
                                        
                                        <p className="price-detail">
                                            <strong>Precio:</strong> $
                                            {seleccionActual.categoria && 
                                             seleccionActual.categoria.precios && 
                                             tipoVehiculo && 
                                             seleccionActual.categoria.precios[
                                                tiposVehiculo.find(t => t.id === tipoVehiculo)?.tamaño
                                             ] || 0}
                                        </p>
                                    </div>
                                </div>
                                
                                <button 
                                    className="add-button"
                                    onClick={() => handleSelection({})}
                                >
                                    Agregar a mi selección
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

// Función auxiliar para obtener un código de color basado en el nombre
const getColorCode = (colorName) => {
    if (!colorName) return '#CCCCCC';
    
    const colorMap = {
        'rojo': '#FF3B30',
        'azul': '#007AFF',
        'negro': '#1D1D1D',
        'negro brillante': '#2C2C2C',
        'blanco': '#F8F8F8',
        'gris grafito': '#636366',
        'dorado': '#D4AF37',
        'amarillo': '#FFCC00',
        'claro': '#E0E0E0',
        'intermedio': '#A0A0A0',
        'oscuro': '#505050'
    };
    
    return colorMap[colorName.toLowerCase()] || '#CCCCCC';
};

export default SeleccionServicio;