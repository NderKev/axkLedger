exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_kyc_info', function (table) {
        table.increments().primary();
        table.string('user_id').unique().notNullable();
        table.string('name', 255).unique().notNullable();
        table.date('dob').notNullable();
        table.string('nationality', 100).notNullable();
        table.enum('gender', ['male', 'female', 'other']);
        table.string('phone', 20).unique().notNullable();
        table.string('email', 255).unique().notNullable();
        table.text('address').notNullable();
        table.string('residence').notNullable();
        table.boolean('kyc_status').defaultTo(false);
        table.timestamps();
      })
    ])
  };

  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_kyc_info')
    ])
  };