import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-1339542259377823-040314-8b3f272a8fb0b25ebbd58a19b96f5bdd-141510028' });

app.post("/create_payment", async (req, res) => {
    const preference = new Preference(client);
    try {
      const response = await preference.create({
        body: {
          items: [
            {
              title: req.body.description,
              quantity: 1,
              unit_price: req.body.transaction_amount,
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

// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});