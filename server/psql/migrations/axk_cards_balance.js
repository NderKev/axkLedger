exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_card_balance', function (table) {
        table.increments().primary();
        table.integer('card_id').unsigned().index().references('card_number').inTable('axk_card').onDelete('restrict').onUpdate('cascade');
        table.enum('currency',['axk', 'btc', 'eth', 'lisk', 'usdc', 'usdt', 'xrp', 'usd', 'euro']);
        table.float('amount', 10, 5).unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_card_balance')
    ])
  };