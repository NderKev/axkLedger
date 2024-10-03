exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_products', function (table) {
        table.increments().primary();
        table.string('farmer_id').index().references('wallet_id').inTable('axk_sc_farmers').onDelete('restrict').onUpdate('cascade').notNullable();
        table.integer('lot_number').unsigned().unique().notNullable();
        table.string('name').notNullable();
        table.string('image');
        table.integer('price').unsigned().notNullable();
        table.string('currency').notNullable();
        table.integer('quantity').unsigned().notNullable();
        table.string('quality', 1000).unique();
        table.tinyint('available');
        table.string('latitude');
        table.string('longitude');
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_products')
    ])
  };