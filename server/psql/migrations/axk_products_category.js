exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('axk_product_category', function (table) {
            table.increments();
            table.enum('category', ['cereals', 'grains', 'cocoa', 'coffee', 'tea', 'pyrethrum', 'cotton', 'other']).notNullable();
            table.string('name').unique().notNullable();
            table.timestamps();
        })
    ])
  };
  //Rollback migration
  exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('axk_product_category')
    ])
  };