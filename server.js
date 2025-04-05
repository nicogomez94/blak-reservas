import express from "express";
import cors from "cors";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import db from "./db.js";
import dotenv from "dotenv";
import { enviarMailDeConfirmacion } from "./mailer.js";

dotenv.config();
const API_URL = process.env.VITE_API_URL;
const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: process.env.TOKEN_MP });

app.post("/create_preference", async (req, res) => {
    const preference = new Preference(client);

    try {
      const response = await preference.create({
        body: {
          items: [
            {
              title: req.body.description,
              quantity: 1,
              unit_price: req.body.transaction_amount
            },
        ],
        payer: req.body.payer,
        notification_url: `${API_URL}/webhook`,
        back_urls: {
			success: "http://localhost:5173/success",
			failure: "http://localhost:5173/",
			pending: "http://localhost:5173/"
		},
		auto_return: "approved"
        },
      });
  
      res.status(200).json({ init_point: response.init_point });
    } catch (error) {
      console.error("Error al crear preferencia:", error);
      res.status(400).json(error);
    }
});

//webhook MP
app.post("/webhook", async (req, res) => {
    const paymentInsta = new Payment(client);
    const payment = req.body;

    if (payment?.type === "payment") {
      try {
        const mpPayment = await paymentInsta.get({ id: payment.data.id });
        const status = mpPayment.api_response.status;

        if (status == "200") {
            const description = mpPayment.additional_info?.items?.[0]?.title || "";
            const match = description.match(/([A-Za-z]{3} [A-Za-z]{3} \d{1,2} \d{4}) a las (\d{2}:\d{2})/);
            const partes = description.split(" - ");
            const servicio = partes[0]; // PLOTEO CHICO $249.000
            // const email = mpPayment.payer?.email || "sin_email@blak.fake";
            const email = "nicolasgomez94@gmail.com";//HARD
          
                if (match) {
                const rawDate = `${match[1]} ${match[2]}`;
                const dateObj = new Date(rawDate);
                
                const fecha = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
                const hora = match[2]; // HH:MM
            
                await db("reservas").insert({ fecha, hora, status, servicio }); // ojo: status acá sigue siendo "200"
                await enviarMailDeConfirmacion({ to: email, fecha, hora }); //mail
                console.log(`✅ Reserva guardada para ${fecha} a las ${hora}`);

                } else {
                    console.log("❌ Error al guardar reserva. falló al matchear.-->"+match);
                }
            } else {
            console.log("❌ Error de red -->"+status);
        }
      } catch (error) {
        console.error("❌ Error al procesar webhook:", error);
      }
    }
  
    res.sendStatus(200);
  });

  app.post('/webhook', (req, res) => {
    console.log('📩 Notificación recibida de Mercado Pago:', req.body);
    res.sendStatus(200);
  });

//reservas guardadas
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

// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});