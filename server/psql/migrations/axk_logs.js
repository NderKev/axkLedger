exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_logs', function (table) {
        table.increments().primary();
        table.string('log_id').notNullable();
        table.jsonb('log').notNullable();
        table.integer('limit').notNullable();
        table.boolean('flag').defaultTo(false);
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_logs')
    ])
  };