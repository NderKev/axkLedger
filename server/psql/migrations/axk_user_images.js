exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_user_images', function (table) {
        table.increments().primary();
        table.string('user_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade').notNullable();
        table.string('path');
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_user_images')
    ])
  };