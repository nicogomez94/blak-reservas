import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import db from "./db.js";
import dotenv from "dotenv";
import { enviarMailDeConfirmacion } from "./mailer.js";
import crypto from "crypto";

dotenv.config();
const API_URL = process.env.VITE_API_URL;
const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: process.env.TOKEN_MP });

app.post("/create_preference", async (req, res) => {
    const preference = new Preference(client);

    try {
        // Asegúrate de que req.body.description sea una cadena, no un objeto
        let description = req.body.description;
        if (typeof description === 'object') {
            description = JSON.stringify(description);
        }

        const preferenceData = {
            body: {
                items: [
                    {
                        id: 'RESERVA',
                        title: description,
                        quantity: 1,
                        unit_price: Number(req.body.transaction_amount),
                        currency_id: 'ARS'
                    },
                ],
                payer: req.body.payer,
                notification_url: `${API_URL}/webhook`,
                back_urls: {
                    success: "http://localhost:5173/success",
                    failure: "http://localhost:5173/fail",
                    pending: "http://localhost:5173/",
                },
                auto_return: "approved",
                statement_descriptor: "Blak Reservas",
                external_reference: crypto.randomBytes(16).toString("hex")
            },
        };

        console.log("Enviando preferencia a MP:", JSON.stringify(preferenceData, null, 2));
        
        const response = await preference.create(preferenceData);
        console.log("Respuesta de MP:", response.init_point);

        res.status(200).json({ init_point: response.init_point });
    } catch (error) {
        console.error("Error al crear preferencia:", error);
        res.status(400).json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// webhook MP
app.post("/webhook", async (req, res) => {
    const paymentInsta = new Payment(client);
    const payment = req.body;

    if (payment?.type === "payment") {
        try {
            const mpPayment = await paymentInsta.get({ id: payment.data.id });
            const status = mpPayment.api_response.status;

            if (status == "200") {
                const rawDesc = mpPayment.additional_info?.items?.[0]?.title || "";
                const email = "nicolasgomez94@gmail.com"; // hardcoded por ahora
                const token = crypto.randomBytes(16).toString("hex");

                let fecha = "";
                let servicios = [];

                try {
                    const parsed = JSON.parse(rawDesc);
                    fecha = parsed.fecha;
                    servicios = parsed.servicios;
                } catch (err) {
                    console.error("❌ No se pudo parsear la descripción:", rawDesc);
                }

                if (fecha) {
                    const reservasEnEseDia = await db("reservas")
                        .where({ fecha })
                        .count("id as total");
                    const cantidad = reservasEnEseDia[0].total;

                    if (cantidad >= 10) {
                        console.warn(
                            `❌ Día ${fecha} ya tiene el cupo completo. No se guarda la reserva.`
                        );
                        return res.sendStatus(200);
                    }

                    // Insertar reserva
                    const reservaId = await db("reservas").insert({
                        fecha,
                        status,
                        token,
                        total: servicios.reduce((sum, servicio) => sum + (servicio.precio || 0), 0),
                    });

                    // Insertar servicios asociados - versión actualizada
                    for (const servicio of servicios) {
                        // Objeto base con los datos comunes
                        const servicioBase = {
                            reserva_id: reservaId[0],
                            nombre: servicio.servicio || servicio.nombre,
                            subtipo: servicio.categoria || null,
                            tamaño: servicio.tamaño || null
                        };
                        
                        // ELIMINADA LA INSERCIÓN DEL REGISTRO BASE
                        // Ahora cada servicio tendrá al menos atributo 'tipo'
                        
                        // Insertar todos los atributos como registros separados
                        const atributosAGuardar = [
                            // Agregamos un atributo 'tipo' para identificar la naturaleza del servicio
                            { atributo: 'tipo', valor: servicio.tipo || 'simple' },
                            servicio.detalle ? { atributo: 'detalle', valor: servicio.detalle } : null,
                            servicio.descripcion ? { atributo: 'descripcion', valor: servicio.descripcion } : null,
                            servicio.atributo ? { atributo: servicio.atributo, valor: servicio.detalle || '' } : null,
                            { atributo: 'precio', valor: String(servicio.precio || 0) }
                        ].filter(item => item !== null); // Eliminar elementos nulos
                        
                        // Insertar cada atributo como un registro
                        for (const item of atributosAGuardar) {
                            await db("servicios").insert({
                                ...servicioBase,
                                atributo: item.atributo,
                                valor: item.valor
                            });
                        }
                    }

                    await enviarMailDeConfirmacion({ to: email, fecha });
                    console.log(`✅ Reserva guardada para ${fecha}`);
                } else {
                    console.log("❌ Fecha no válida, no se guardó la reserva.");
                }
            } else {
                console.log("❌ Error de red -->", status);
            }
        } catch (error) {
            console.error("❌ Error al procesar webhook:", error);
        }
    }

    res.sendStatus(200);
});

// reservas guardadas
app.get("/reservas", async (req, res) => {
    const reservas = await db("reservas").select();
    res.json(reservas);
});

app.delete("/reservas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db("reservas").where("id", id).del();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error al eliminar reserva:", error);
        res.status(500).json({ success: false, error: "No se pudo eliminar la reserva." });
    }
});

// Actualizado el endpoint para recuperar servicios con la nueva estructura
app.get("/servicios/:reservaId", async (req, res) => {
    const { reservaId } = req.params;
    try {
        // Obtener todos los registros de servicios para esta reserva
        const serviciosRaw = await db("servicios").where({ reserva_id: reservaId });
        
        // Agrupar por nombre de servicio para reconstruir la estructura
        const serviciosAgrupados = {};
        
        for (const srv of serviciosRaw) {
            const clave = `${srv.nombre}-${srv.subtipo || ''}`;
            
            if (!serviciosAgrupados[clave]) {
                serviciosAgrupados[clave] = {
                    id: srv.id,
                    servicio: srv.nombre,
                    nombre: srv.nombre,
                    categoria: srv.subtipo,
                    tamaño: srv.tamaño
                };
            }
            
            // Agregar atributos como propiedades dinámicas
            if (srv.atributo && srv.valor) {
                serviciosAgrupados[clave][srv.atributo] = srv.atributo === 'precio' 
                    ? parseFloat(srv.valor) 
                    : srv.valor;
            }
        }
        
        // Convertir el objeto agrupado en un array
        const serviciosFinal = Object.values(serviciosAgrupados);
        
        res.json(serviciosFinal);
    } catch (error) {
        console.error("Error al obtener los servicios:", error);
        res.status(500).json({ error: "No se pudieron obtener los servicios." });
    }
});

app.put("/reservas/:id", async (req, res) => {
    const { id } = req.params;
    const updatedReserva = req.body;

    try {
        await db("reservas").where("id", id).update(updatedReserva);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error al actualizar la reserva:", error);
        res.status(500).json({ success: false, error: "No se pudo actualizar la reserva." });
    }
});

app.put("/servicios/:id", async (req, res) => {
    const { id } = req.params;
    const updatedServicio = req.body;

    try {
        // Extraer los atributos básicos para el registro principal
        const { servicio, nombre, categoria, tamaño, ...atributos } = updatedServicio;
        
        // Actualizar los datos base en todos los registros relacionados con este servicio
        await db("servicios")
            .where({ 
                reserva_id: updatedServicio.reserva_id,
                nombre: updatedServicio.nombre || updatedServicio.servicio
            })
            .update({
                nombre: servicio || nombre,
                subtipo: categoria || null,
                tamaño: tamaño || null
            });
        
        // Para cada atributo adicional, actualizar o crear un registro
        for (const [attr, valor] of Object.entries(atributos)) {
            // Evitar actualizar campos internos/especiales
            if (attr !== 'id' && attr !== 'reserva_id') {
                // Verificar si ya existe un registro para este atributo
                const existente = await db("servicios")
                    .where({ 
                        reserva_id: updatedServicio.reserva_id,
                        nombre: servicio || nombre,
                        atributo: attr
                    })
                    .first();
                
                if (existente) {
                    // Actualizar el registro existente
                    await db("servicios")
                        .where({ id: existente.id })
                        .update({ valor: String(valor) });
                } else {
                    // Crear un nuevo registro para este atributo
                    await db("servicios").insert({
                        reserva_id: updatedServicio.reserva_id,
                        nombre: servicio || nombre,
                        subtipo: categoria || null,
                        atributo: attr,
                        valor: String(valor),
                        tamaño: tamaño || null
                    });
                }
            }
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error al actualizar el servicio:", error);
        res.status(500).json({ success: false, error: "No se pudo actualizar el servicio." });
    }
});

// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
    console.log("Servidor corriendo en http://localhost:3001");
});
