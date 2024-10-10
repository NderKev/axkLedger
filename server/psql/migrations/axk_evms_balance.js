exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_evm_balance', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade').notNullable();
        table.enum('crypto',['axk', 'eth', 'lisk', 'usdc', 'usdt', 'xrp', 'eurc', 'chnt', 'matic', 'other']).notNullable();
        table.string('name', 100).notNullable();
        table.string('address').index().references('address').inTable('axk_evm').onDelete('restrict').onUpdate('cascade').notNullable();
        table.float('balance', 10, 5).unsigned();
        table.float('usd', 10, 5).unsigned();
        table.enum('status',['complete', 'pending', 'refunded', 'failed']);
        table.timestamps();
      })
    ])
  };

  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_evm_balance')
    ])
  };