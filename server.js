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
    try {
        const preference = new Preference(client);

        const { description, transaction_amount, payer } = req.body;
        
        // Log para depuración
        console.log("Recibido en create_preference:", {
            description: description.substring(0, 100) + "...", 
            transaction_amount,
            payer
        });

        let title = "Reserva Blak";
        let fecha = "";
        let serviciosData = [];
        let clienteData = {}; // Datos del cliente del formulario
        
        // Generar token único para esta reserva
        const reservaToken = crypto.randomBytes(16).toString("hex");
        
        try {
            if (typeof description === 'string') {
                const parsed = JSON.parse(description);
                fecha = parsed.fecha;
                title = `Reserva Blak para ${fecha}`;
                serviciosData = parsed.servicios || [];
                
                // Extraer datos del cliente del formulario
                clienteData = parsed.cliente || {};
                
                // Guardar temporalmente los detalles de la reserva pendiente incluyendo datos del cliente
                await db("reservas_pendientes").insert({
                    token: reservaToken,
                    fecha,
                    servicios: JSON.stringify(serviciosData),
                    cliente: JSON.stringify(clienteData), // Guardar datos del cliente tal cual
                    monto: transaction_amount,
                    created_at: new Date()
                });
            }
        } catch (err) {
            console.error("Error al parsear description:", err);
        }

        // Crear la preferencia con datos validados
        const preferenceData = {
            body: {
                items: [
                    {
                        id: "RESERVA",
                        title: title,
                        quantity: 1,
                        unit_price: Number(transaction_amount),
                        currency_id: "ARS"
                    },
                ],
                back_urls: {
                    // Añadir el token a la URL de éxito para verificación posterior
                    success: `http://localhost:5173/success?token=${reservaToken}`,
                    failure: "http://localhost:5173/fail",
                    pending: "http://localhost:5173/pending"
                },
                notification_url: `${API_URL}/webhook`,
                auto_return: "approved",
                statement_descriptor: "Blak Detailing",
                expires: true,
                expiration_date_to: new Date(Date.now() + 3600000).toISOString(),
                external_reference: reservaToken // Usamos el token como referencia externa
            },
        };

        if (payer && payer.email) {
            preferenceData.body.payer = {
                email: payer.email,
                name: payer.name || "Cliente",
                identification: payer.identification || { type: "DNI", number: "00000000" }
            };
        }

        console.log("Enviando preferencia a MercadoPago:", JSON.stringify(preferenceData, null, 2));
        const response = await preference.create(preferenceData);
        
        console.log("Respuesta de MercadoPago:", {
            id: response.id,
            init_point: response.init_point,
            token: reservaToken
        });

        res.status(200).json({
            id: response.id,
            init_point: response.init_point,
            token: reservaToken // Devolvemos el token para uso en el frontend
        });
    } catch (error) {
        console.error("Error al crear preferencia:", error);
        console.error("Detalles adicionales:", error.cause || error.message);
        
        res.status(500).json({
            error: "Error al crear preferencia de pago",
            message: error.message,
            details: process.env.NODE_ENV === "development" ? error.stack : undefined
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
                // Obtener el token de referencia
                const externalRef = mpPayment.external_reference;
                
                // Si no hay referencia, intentamos extraer la fecha del título como fallback
                const rawTitle = mpPayment.additional_info?.items?.[0]?.title || "";
                const email = "nicolasgomez94@gmail.com";
                const token = externalRef || crypto.randomBytes(16).toString("hex");
                
                let fecha = "";
                let servicios = [];
                let reservaGuardada = false;
                
                try {
                    // Obtener la reserva pendiente que contiene todos los datos
                    const reservaPendiente = await db("reservas_pendientes")
                        .where({ token: externalRef })
                        .first();
                    
                    if (reservaPendiente) {
                        fecha = reservaPendiente.fecha;
                        
                        // Recuperar servicios
                        try {
                            servicios = JSON.parse(reservaPendiente.servicios);
                            console.log("✅ Servicios recuperados de reserva pendiente:", servicios.map(s => s.servicio).join(", "));
                        } catch (e) {
                            console.error("Error al parsear servicios de reserva pendiente:", e);
                        }
                        
                        // Recuperar datos del cliente SOLO del formulario guardado
                        let clienteData = {};
                        try {
                            if (reservaPendiente.cliente) {
                                clienteData = JSON.parse(reservaPendiente.cliente);
                                console.log("✅ Datos del cliente recuperados del formulario:", clienteData);
                            }
                        } catch (e) {
                            console.error("Error al parsear datos del cliente:", e);
                        }
                        
                        // Insertar la reserva con los datos que ya hemos reunido
                        const reservaId = await db("reservas").insert({
                            fecha,
                            status,
                            token,
                            total: servicios.reduce((sum, servicio) => sum + (servicio.precio || 0), 0),
                            nombre: clienteData.nombre || null,
                            telefono: clienteData.telefono || null,
                            email: clienteData.email || null,
                            auto: clienteData.auto || null
                        });
                        
                        // Insertar servicios asociados
                        for (const servicio of servicios) {
                            // Objeto base con los datos comunes
                            const servicioBase = {
                                reserva_id: reservaId[0],
                                nombre: servicio.servicio || servicio.nombre,
                                subtipo: servicio.categoria || null,
                                tamaño: servicio.tamaño || null
                            };
                            
                            // Insertar todos los atributos como registros separados
                            const atributosAGuardar = [
                                { atributo: 'tipo', valor: servicio.tipo || 'simple' },
                                servicio.detalle ? { atributo: 'detalle', valor: servicio.detalle } : null,
                                servicio.descripcion ? { atributo: 'descripcion', valor: servicio.descripcion } : null,
                                servicio.atributo ? { atributo: servicio.atributo, valor: servicio.detalle || '' } : null,
                                { atributo: 'precio', valor: String(servicio.precio || 0) }
                            ].filter(item => item !== null);
                            
                            for (const item of atributosAGuardar) {
                                await db("servicios").insert({
                                    ...servicioBase,
                                    atributo: item.atributo,
                                    valor: item.valor
                                });
                            }
                        }

                        // Marcar que la reserva se guardó exitosamente
                        reservaGuardada = true;
                        
                        // Limpiar la reserva pendiente si existe
                        if (externalRef) {
                            await db("reservas_pendientes")
                                .where({ token: externalRef })
                                .delete();
                        }

                        await enviarMailDeConfirmacion({ to: email, fecha });
                        console.log(`✅ Reserva guardada para ${fecha}`);
                    } else {
                        console.log("❌ No se encontró la reserva pendiente con token:", externalRef);
                    }
                } catch (err) {
                    console.error("Error al procesar reserva:", err);
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

// Nuevo endpoint para verificar el estado de la reserva después del pago
app.get("/verificar-reserva/:token", async (req, res) => {
    const { token } = req.params;
    
    try {
        // Verificar si existe en reservas (éxito)
        const reservaExitosa = await db("reservas")
            .where({ token })
            .first();
        
        if (reservaExitosa) {
            return res.json({
                status: "success",
                message: "Reserva confirmada exitosamente",
                reserva: {
                    id: reservaExitosa.id,
                    fecha: reservaExitosa.fecha
                }
            });
        }
        
        // Verificar si existe en reservas_pendientes (pendiente o fallida)
        const reservaPendiente = await db("reservas_pendientes")
            .where({ token })
            .first();
            
        if (reservaPendiente) {
            // Si tiene un status de error
            if (reservaPendiente.status && reservaPendiente.status.startsWith("FAILED_")) {
                let mensaje = "No se pudo completar la reserva";
                
                if (reservaPendiente.status === "FAILED_QUOTA_EXCEEDED") {
                    mensaje = "Lo sentimos, el cupo para ese día ya está completo";
                } else if (reservaPendiente.status === "FAILED_INVALID_DATE") {
                    mensaje = "La fecha seleccionada no es válida";
                }
                
                return res.json({
                    status: "error",
                    message: mensaje,
                    error: reservaPendiente.status
                });
            }
            
            // Si está pendiente (sin status o con status diferente a error)
            return res.json({
                status: "pending",
                message: "El pago se ha realizado pero la reserva está pendiente de confirmación"
            });
        }
        
        // No se encontró ninguna reserva con ese token
        return res.json({
            status: "error",
            message: "No se encontró ninguna reserva con ese token"
        });
    } catch (error) {
        console.error("Error al verificar reserva:", error);
        res.status(500).json({
            status: "error",
            message: "Error al verificar el estado de la reserva"
        });
    }
});

// Ruta PUT para actualizar servicios
app.put("/servicios/:reservaId/:servicioId", async (req, res) => {
  try {
    const { reservaId, servicioId } = req.params;
    const updateData = req.body;
    
    console.log(`Actualizando servicio ID ${servicioId} de reserva ${reservaId}`);
    console.log("Datos recibidos:", updateData);
    
    // Extraer el nombre del atributo y su valor
    const atributoNombre = Object.keys(updateData).find(key => 
      !['id', 'reserva_id', 'nombre'].includes(key));
    
    if (!atributoNombre) {
      return res.status(400).json({ 
        success: false, 
        error: "No se especificó qué atributo actualizar" 
      });
    }
    
    const valorAtributo = updateData[atributoNombre];
    const nombreServicio = updateData.nombre || 'Fumé ópticas'; // Valor por defecto
    
    console.log(`Buscando registro para servicio "${nombreServicio}", atributo "${atributoNombre}"`);
    
    // IMPORTANTE: Búsqueda más precisa que incluye el nombre del servicio
    const registroExistente = await db("servicios")
      .where({ 
        reserva_id: parseInt(reservaId),
        atributo: atributoNombre
      })
      .whereRaw("LOWER(nombre) LIKE ?", [`%${nombreServicio.toLowerCase()}%`])
      .first();
    
    if (registroExistente) {
      console.log(`✅ Registro encontrado ID: ${registroExistente.id}, actualizando...`);
      
      await db("servicios")
        .where({ id: registroExistente.id })
        .update({ valor: String(valorAtributo) });
        
      return res.status(200).json({ 
        success: true,
        message: `Registro ${registroExistente.id} actualizado con éxito` 
      });
    } else {
      console.log(`⚠️ No se encontró registro para "${nombreServicio}", atributo "${atributoNombre}"`);
      console.log("Intentando búsqueda menos específica...");
      
      // Intento de búsqueda menos específica como respaldo
      const registroAlternativo = await db("servicios")
        .where({ 
          reserva_id: parseInt(reservaId),
          atributo: atributoNombre
        })
        .first();
      
      if (registroAlternativo) {
        console.log(`✅ Se encontró registro alternativo ID: ${registroAlternativo.id}`);
        
        await db("servicios")
          .where({ id: registroAlternativo.id })
          .update({ valor: String(valorAtributo) });
          
        return res.status(200).json({ 
          success: true,
          message: `Registro alternativo ${registroAlternativo.id} actualizado` 
        });
      } else {
        // Si realmente no existe, entonces creamos uno nuevo
        console.log("Creando nuevo registro...");
        
        // Obtener información básica para crear un registro coherente
        const nuevoId = await db("servicios").insert({
          reserva_id: parseInt(reservaId),
          nombre: nombreServicio,
          atributo: atributoNombre,
          valor: String(valorAtributo)
        });
        
        return res.status(201).json({ 
          success: true,
          message: `Creado nuevo registro con ID ${nuevoId}` 
        });
      }
    }
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al actualizar: " + error.message 
    });
  }
});

// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
    console.log("Servidor corriendo en http://localhost:3001");
});
