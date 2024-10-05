exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_kyc_farmers', function (table) {
        table.increments().primary();
        table.string('farmer_id').index().references('user_id').inTable('axk_kyc_info').onDelete('restrict').onUpdate('cascade');
        table.boolean('verified_phone').defaultTo(false);
        table.string('location', 500).notNullable();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_kyc_farmers')
    ])
  };