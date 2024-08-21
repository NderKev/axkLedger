exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_auth_jwt', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.integer('expiration').unsigned();
        table.string('token');
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_auth_jwt')
    ])
  };