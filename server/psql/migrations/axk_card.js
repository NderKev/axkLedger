exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_card', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.string('card_name');
        table.integer('card_number').unsigned().unique();
        table.enum('type',['debit', 'credit']);
        table.enum('state',['active', 'expired', 'inactive']);
        table.float('balance', 10, 5).unsigned();
        table.integer('cvc').unsigned();
        table.string('expiry');
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_card')
    ])
  };