import knex from "knex";

const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./reservas.db",
  },
  useNullAsDefault: true,
});

// Crear la tabla de reservas para incluir los datos del cliente
db.schema.hasTable("reservas").then((exists) => {
  if (!exists) {
    return db.schema.createTable("reservas", (table) => {
      table.increments("id").primary();
      table.string("fecha");
      table.string("status");
      table.string("token");
      table.decimal("total", 10, 2);
      table.string("nombre").nullable();     // Nombre del cliente
      table.string("telefono").nullable();   // Teléfono del cliente
      table.string("email").nullable();      // Email del cliente
      table.string("auto").nullable();       // Información del auto
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  } else {
    // Verificar si necesitamos añadir las columnas a una tabla existente
    return db.schema.hasColumn("reservas", "nombre").then(exists => {
      if (!exists) {
        return db.schema.table("reservas", table => {
          table.string("nombre").nullable();
          table.string("telefono").nullable();
          table.string("email").nullable();
          table.string("auto").nullable();
        });
      }
    });
  }
});

// Crear la tabla de servicios si no existe
db.schema.hasTable("servicios").then((exists) => {
  if (!exists) {
    return db.schema.createTable("servicios", (table) => {
      table.increments("id").primary();
      table.integer("reserva_id").unsigned().references("id").inTable("reservas").onDelete("CASCADE");
      table.string("nombre");
      table.string("subtipo").nullable();
      table.string("atributo").nullable();
      table.string("valor").nullable();
      table.string("tamaño").nullable();
    });
  }
});

// Añadir después de las otras definiciones de tablas
db.schema.hasTable("reservas_pendientes").then((exists) => {
  if (!exists) {
    return db.schema.createTable("reservas_pendientes", (table) => {
      table.increments("id").primary();
      table.string("token").unique();
      table.string("fecha");
      table.text("servicios");  // Para guardar JSON
      table.text("cliente"); // <-- Nuevo campo para datos del cliente como JSON
      table.decimal("monto", 10, 2);
      table.string("status").nullable(); // Nuevo campo para status (null, FAILED_QUOTA_EXCEEDED, etc)
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  } else {
    // Verificar si necesitamos añadir la columna cliente a una tabla existente
    return db.schema.hasColumn("reservas_pendientes", "cliente").then(exists => {
      if (!exists) {
        return db.schema.table("reservas_pendientes", table => {
          table.text("cliente").nullable();
        });
      }
    });
  }
});

export default db;