exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_sc_sell', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('farmer').index().references('address').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('buyer').index().references('address').inTable('axk_evm').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('tx_hash', 500).unique().notNullable();
        table.string('hash', 500).unique().notNullable();
        table.string('timestamp').notNullable();
        table.integer('amount').unsigned();
        table.integer('price').unsigned();
        table.integer('index').unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_sc_sell')
    ])
  };