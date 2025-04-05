import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import db from "./db.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-1339542259377823-040314-8b3f272a8fb0b25ebbd58a19b96f5bdd-141510028' });

app.post("/create_preference", async (req, res) => {
    const preference = new Preference(client);

    try {
      const response = await preference.create({
        body: {
          items: [
            {
              title: req.body.description,
              quantity: 1,
              unit_price: req.body.transaction_amount,
              notification_url: "https://2e2b-2800-2130-293f-e214-4e07-5b49-a336-477d.ngrok-free.app/webhook"
            },
          ],
          payer: req.body.payer,
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
    const payment = req.body;
  
    if (payment?.type === "payment") {
      try {
        const mpPayment = await mercadopago.payment.findById(payment.data.id);
        const status = mpPayment.response.status;
  
        if (status === "approved") {
          const description = mpPayment.response.additional_info?.items?.[0]?.title || "";
          const match = description.match(/(\d{4}-\d{2}-\d{2}).*?(\d{2}:\d{2})/);
          if (match) {
            const fecha = match[1];
            const hora = match[2];
            await db("reservas").insert({ fecha, hora, status });
            console.log(`✅ Reserva guardada para ${fecha} a las ${hora}`);
          }
        }
      } catch (error) {
        console.error("❌ Error al procesar webhook:", error);
      }
    }
  
    res.sendStatus(200);
  });

//reservas guardadas
app.get("/reservas", async (req, res) => {
    const reservas = await db("reservas").select();
    res.json(reservas);
});

// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});