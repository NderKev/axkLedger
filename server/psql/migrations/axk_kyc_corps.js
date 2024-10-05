exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_kyc_corporate', function (table) {
        table.increments().primary();
        table.string('corp_name', 255).unique().notNullable();
        table.string('corp_type', 50).notNullable();
        table.string('corp_reg_no', 100).unique().notNullable();
        table.string('corp_contact', 255).notNullable();
        table.string('corp_contact_id', 500).notNullable();
        table.text('corp_address').notNullable();
        table.string('corp_revenue', 500).notNullable();
        table.string('corp_tax_id', 100).unique().notNullable();
        table.text('corp_bank').unique().notNullable();
        table.string('corp_statement', 500).notNullable();
        table.boolean('corp_kyc_status').defaultTo(false);
        table.timestamps();
      })
    ])
  };

  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_kyc_corporate')
    ])
  };