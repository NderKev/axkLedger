exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_kyc_docs', function (table) {
        table.increments().primary();
        table.string('user_id').index().references('user_id').inTable('axk_kyc_info').onDelete('restrict').onUpdate('cascade');
        table.string('url', 500).notNullable();
        table.string('id_passport', 100).unique().notNullable();
        table.date('issue').notNullable();
        table.date('expiry').notNullable();
        table.string('selfie', 500).notNullable();
        table.string('proof', 500).notNullable();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_kyc_docs')
    ])
  };