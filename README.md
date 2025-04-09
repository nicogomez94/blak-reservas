# ✨ Blak Reservas

## 📝 Descripción del Proyecto

Blak Reservas es una aplicación web 🚀 diseñada para gestionar reservas de servicios. Permite a los usuarios seleccionar un tipo de vehículo 🚗, elegir servicios 🛠️ y especificar detalles adicionales para cada uno. ¡Y eso no es todo! También cuenta con un panel de administración 🛡️ para gestionar las reservas.

## 🌟 Características Principales

*   **🎨 Selección de Servicios:**
    *   Interfaz de usuario intuitiva 🖱️ para seleccionar el tipo de vehículo 🚗 y los servicios deseados.
    *   Validación de atributos requeridos ✅ antes de confirmar la selección.
    *   Cálculo dinámico 🧮 del total a pagar según los servicios seleccionados y el tipo de vehículo.
*   **🛡️ Panel de Administración:**
    *   Autenticación de administrador 🔑.
    *   Visualización de todas las reservas 🗓️ con detalles como fecha, estado, total y servicios asociados.
    *   Edición ✏️ y eliminación 🗑️ de reservas existentes.
    *   Edición de atributos de servicios asociados a cada reserva.
*   **💰 Integración con Mercado Pago:**
    *   Creación de preferencias de pago en Mercado Pago para cada reserva.
    *   Notificaciones de Mercado Pago a través de webhooks 📡 para actualizar el estado de las reservas.
    *   Redirección a páginas de éxito 👍 o fallo 👎 según el resultado del pago.
*   **🗄️ Base de Datos:**
    *   Utilización de SQLite para almacenar la información de las reservas y los servicios.
    *   Estructura de base de datos optimizada para la gestión eficiente de las reservas y sus servicios asociados.
*   **📅 Manejo de Cupos:**
    *   Validación de cupos diarios para evitar la sobre-reserva de servicios en un mismo día.
*   **📧 Envío de Emails:**
    *   Envío de emails de confirmación a los usuarios después de realizar una reserva.

## 🗂️ Estructura del Proyecto

El proyecto está estructurado en los siguientes directorios y archivos principales:

*   `src/`: Contiene el código fuente de la aplicación.
    *   `components/`: Contiene los componentes React reutilizables.
        *   `AdminPanel.jsx`: Componente para el panel de administración.
        *   `AdminLogin.jsx`: Componente para el inicio de sesión del administrador.
        *   `SeleccionServicio.jsx`: Componente para la selección de servicios por parte del usuario.
    *   `App.jsx`: Componente principal de la aplicación.
    *   `main.jsx`: Punto de entrada de la aplicación React.
*   `db.js`: Configuración y conexión a la base de datos SQLite.
*   `server.js`: Servidor Express que maneja las API y la lógica del backend.
*   `mailer.js`: Configuración y funciones para el envío de emails.
*   `AdminPanel.css`: Estilos CSS para el componente AdminPanel.
*   `SeleccionServicio.css`: Estilos CSS para el componente SeleccionServicio.
*   `package.json`: Archivo de configuración del proyecto Node.js.
*   `README.md`: Este archivo.

## 🛠️ Tecnologías Utilizadas

*   React
*   Express
*   Knex.js
*   SQLite
*   Mercado Pago SDK
*   Nodemailer
*   Axios
*   CORS
*   Dotenv


## 💻 Uso

1.  **Acceder a la aplicación:**

    *   Abrir un navegador web 🌐 y acceder a la URL del frontend (por defecto, `http://localhost:5173`).

2.  **Seleccionar servicios:**

    *   Elegir el tipo de vehículo 🚗.
    *   Seleccionar los servicios deseados 🛠️.
    *   Completar los detalles adicionales para cada servicio.
    *   Confirmar la selección y proceder al pago 💰 a través de Mercado Pago.

3.  **Administrar reservas:**

    *   Acceder al panel de administración 🛡️ (ruta protegida, requiere inicio de sesión).
    *   Visualizar, editar ✏️ y eliminar 🗑️ reservas.
    *   Gestionar los servicios asociados a cada reserva.

## 🚀 Próximas Mejoras

*   Implementar un sistema de usuarios 🧑‍🤝‍🧑 para que los clientes puedan gestionar sus propias reservas.
*   Agregar más opciones de personalización para los servicios.
*   Mejorar la interfaz de usuario y la experiencia del usuario en general.
*   Implementar pruebas unitarias y de integración.
*   Documentar el código con JSDoc.
