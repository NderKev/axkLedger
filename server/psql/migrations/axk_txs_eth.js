exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_txs_eth', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.string('address');
        table.string('tx_hash').unique();
        table.enum('mode',['axk', 'eth', 'lisk', 'usdc', 'usdt', 'xrp', 'chnt', 'eurc']);
        table.enum('type',['debit', 'credit', 'loan', 'repayment', 'transfer']);
        table.string('to');
        table.enum('status',['complete', 'pending', 'failed']);
        table.float('value', 10, 5).unsigned();
        table.float('fiat', 10, 5).unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_txs_eth')
    ])
  };
  