exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_user_role', function (table) {
        table.increments().primary();
        table.enum('role',['admin', 'farmer', 'buyer']).notNullable();
        table.timestamps();
      })
    ])
  };
  
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_user_role')
    ])
  };