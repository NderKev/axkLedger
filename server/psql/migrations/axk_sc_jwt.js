exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_sc_farmers_jwt', function (table) {
        table.increments().primary();
        table.string('address').index().references('address').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.integer('expiry').unsigned().notNullable();
        table.string('token', 2000).notNullable();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_sc_farmers_jwt')
    ])
  };