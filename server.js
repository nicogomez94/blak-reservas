import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import db from "./db.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-7045728362832938-040422-b215197905b892d79ce5a4013a7f1fb5-2370696918' });

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
        notification_url: "https://2e2b-2800-2130-293f-e214-4e07-5b49-a336-477d.ngrok-free.app/webhook"
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
            console.log(mpPayment.additional_info.items);
            const description = mpPayment.additional_info?.items?.[0]?.title || "";
            console.log("descri-->" + description);
          
            const match = description.match(/([A-Za-z]{3} [A-Za-z]{3} \d{1,2} \d{4}) a las (\d{2}:\d{2})/);
          
                if (match) {
                const rawDate = `${match[1]} ${match[2]}`;
                const dateObj = new Date(rawDate);
                
                const fecha = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
                const hora = match[2]; // HH:MM
            
                await db("reservas").insert({ fecha, hora, status }); // ojo: status acá sigue siendo "200"
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

// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});