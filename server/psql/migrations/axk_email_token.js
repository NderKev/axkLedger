exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_email_token', function (table) {
        table.increments().primary();
        table.string('email').index().references('email').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.integer('expiry').unsigned();
        table.string('token');
        table.tinyint('used').unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_email_token')
    ])
  };