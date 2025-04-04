import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mercadopago from "mercadopago";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
dotenv.config();
console.log("Token de Mercado Pago:", process.env.MP_ACCESS_TOKEN);
console.log("CONFIGURATIONS",mercadopago);
console.log("DEFAULT",mercadopago.MercadoPagoConfig);

/*mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});*/

/*afunciona con cofirguratios noseporque mierda*/

// EN LA DOCUY DICE mercadopago.references.create
// https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/checkout-customization/preferences/preference-multiple-items

// y para checkout pro

mercadopago.configurations = {
  access_token: "TEST-1339542259377823-040314-54cf693c36f008c0541b0860875f0004-141510028"
//   access_token: process.env.MP_ACCESS_TOKEN
};

app.post("/create_preference", (req, res) => {
    const { date, time } = req.body;
  
    const preference = {
      items: [
        {
          title: `Reserva Keramik - ${date} a las ${time}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: 5000,
        },
      ],
      back_urls: {
        success: "http://localhost:5173/success",
        failure: "http://localhost:5173/failure",
        pending: "http://localhost:5173/pending",
      },
      auto_return: "approved",
    };
  
    // 🔹 Instanciar Preference antes de usarlo
    const preferenceInstance = new mercadopago.Preference();
  
    preferenceInstance.create(preference)
      .then(function (response) {
        res.json({ init_point: response.body.init_point });
      })
      .catch(function (error) {
        console.error("Error al crear la preferencia:", error);
        res.status(500).json({ error: "Error en el servidor" });
      });
  });


/*
// Endpoint para crear una preferencia de pago
app.post("/create_preference", async (req, res) => {
    try {
      const { date, time } = req.body;
      const preference = {
        items: [
          {
            title: `Reserva Keramik - ${date} a las ${time}`,
            unit_price: 5000,
            quantity: 1,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: "http://localhost:5173/success",
          failure: "http://localhost:5173/failure",
          pending: "http://localhost:5173/pending",
        },
        auto_return: "approved"
      };
  
      // 🔹 Nueva forma de crear la preferencia
      const preferenceInstance = new mercadopago.Preference();
      const response = await preferenceInstance.create(preference);
  
      res.json({ init_point: response.init_point });
    } catch (error) {
      console.error("Error al crear la preferencia:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });*/
  
  // Iniciar el servidor en el puerto 3001
  app.listen(3001, () => {
    console.log("Servidor corriendo en http://localhost:3001");
  });