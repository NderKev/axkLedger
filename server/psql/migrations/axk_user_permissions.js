exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_user_permission', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.integer('role_id').unsigned().index().references('id').inTable('axk_user_role').onDelete('restrict').onUpdate('cascade');
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_user_permission')
    ])
  };