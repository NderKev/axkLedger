exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_wallet', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.string('mnemonic').unique();
        table.string('passphrase').unique();
        table.enum('kyc',['verified', 'pending', 'started', 'failed']);
        table.float('total', 10, 5).unsigned();
        table.timestamps();
      })
    ])
  };

  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_wallet')
    ])
  };