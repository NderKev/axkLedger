exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_sc_products', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('farmer').index().references('address').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('owner').notNullable();
        table.string('produce_hash', 500).unique().notNullable();
        table.string('tx_hash', 500).unique().notNullable();
        table.string('lot_number').notNullable();
        table.string('creation_date').notNullable();
        //table.enum('mode',['axk', 'btc', 'eth', 'lisk', 'usdc', 'usdt', 'xrp']);
        table.enum('type',['product', 'owner', 'change']);
        table.string('produce_type').notNullable();
        //table.enum('status',['complete', 'pending', 'failed']);
        //table.integer('quantity').unsigned();
        //table.float('fiat', 10, 5).unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_sc_products')
    ])
  };