exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_sc_product_own', function (table) {
        table.increments().primary();
        table.string('address').notNullable();
        table.string('product_hash', 500).notNullable();
        table.string('tx_hash', 500).unique().notNullable();
        table.enum('size',['product', 'consignment']);
        table.enum('type',['owner', 'change']);
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_sc_product_own')
    ])
  };