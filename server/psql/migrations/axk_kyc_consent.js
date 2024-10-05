exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_kyc_consent', function (table) {
        table.increments().primary();
        table.string('cons_id').unique().notNullable();
        table.boolean('cons_consent').defaultTo(false);
        table.timestamp('cons_time', { precision: 8 }).defaultTo(knex.fn.now(8));
        table.string('cons_version', 50).notNullable();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_kyc_consent')
    ])
  };