import knex from "knex";

const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./reservas.db",
  },
  useNullAsDefault: true,
});

// Crear la tabla si no existe
db.schema.hasTable("reservas").then((exists) => {
  if (!exists) {
    return db.schema.createTable("reservas", (table) => {
      table.increments("id").primary();
      table.string("fecha");
      table.string("hora");
      table.string("status");
      table.timestamp("created_at").defaultTo(db.fn.now());
    });
  }
});

export default db;