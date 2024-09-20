exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_sc_consignments', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('farmer').index().references('address').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('owner').notNullable();
        table.string('p_hash', 500).unique().notNullable();
        table.string('tx_hash', 500).unique().notNullable();
        table.string('lot_number').notNullable();
        table.string('storage_date').notNullable();
        table.enum('type',['consignment', 'owner', 'change']);
        table.string('weight').notNullable();
        table.integer('quantity').unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_sc_consignments')
    ])
};