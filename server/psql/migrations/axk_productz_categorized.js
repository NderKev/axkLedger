exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_product_categorized', function (table) {
        table.increments().primary();
        table.integer('product_id').unsigned().index().references('lot_number').inTable('axk_products').onDelete('restrict').onUpdate('cascade');
        table.string('category').index().references('name').inTable('axk_product_category').onDelete('restrict').onUpdate('cascade');
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_product_categorized')
    ])
  };