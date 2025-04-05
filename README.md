# 🧼 Sistema de Reservas para Keramik

Sistema web completo para la gestión de turnos en **Keramik**, un centro de detailing automotriz.  
Permite a los clientes seleccionar una fecha y horario disponibles, realizar un pago con Mercado Pago, y recibir un correo de confirmación automático.

---

## ✨ Funcionalidades

- 📅 Calendario interactivo con horarios dinámicos
- 💳 Integración con Mercado Pago (con webhook y seña obligatoria)
- 💾 Almacenamiento de reservas en base de datos (SQLite o MySQL)
- 🔒 Panel de administración protegido por login
- ❌ Posibilidad de eliminar turnos para liberar horarios
- 📧 Envío automático de correo de confirmación al cliente

---

## 🧠 Tecnologías utilizadas

### 🖥️ Frontend
- React + Vite
- React Calendar
- Axios
- CSS puro

### 🔧 Backend
- Node.js + Express
- Knex.js para base de datos
- Mercado Pago SDK
- Nodemailer para envío de mails

---

## 🚀 Instalación

### Backend

```bash
cd backend
npm install
