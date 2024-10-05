exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_kyc_business', function (table) {
        table.increments().primary();
        table.string('biz_name', 255).unique().notNullable();
        table.string('biz_type', 50).notNullable();
        table.string('biz_reg_no', 100).unique().notNullable();
        table.text('biz_address').notNullable();
        table.string('biz_id', 500).notNullable();
        table.string('biz_funding', 500).notNullable();
        table.string('biz_tax_id', 100).unique().notNullable();
        table.text('biz_bank').unique().notNullable();
        table.string('biz_statement', 500).notNullable();
        table.boolean('biz_kyc_status').defaultTo(false);
        table.timestamps();
      })
    ])
  };

  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_kyc_business')
    ])
  };