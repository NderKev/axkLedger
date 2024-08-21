exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_txs', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.string('address');
        table.string('tx_hash').unique();
        table.enum('mode',['axk', 'btc', 'eth', 'lisk', 'usdc', 'usdt', 'xrp']);
        table.enum('type',['debit', 'credit', 'loan', 'repayment', 'transfer']);
        table.string('to');
        table.enum('status',['complete', 'pending', 'failed']);
        table.integer('value').unsigned();
        table.float('fiat', 10, 5).unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_txs')
    ])
  };
  