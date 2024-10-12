const db = require('./db');
const moment = require('moment');

exports.createWallet = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_wallet').insert({
    wallet_id: data.wallet_id,
    mnemonic: data.mnemonic,
    passphrase: data.passphrase,
    kyc : "pending",
    total : 0,
    created_at: createdAt,
    updated_at: createdAt
  });
  console.info("query -->", query.toQuery())
  return query;
};

exports.getWallet = async (data) => {
  const query = db.read.select('*')
    .from('axk_wallet')
    .where('wallet_id', data);   
    return query;
};

exports.checkWallet = async (data) => {
  const query = db.read.select('axk_wallet.kyc', 'axk_wallet.total')
    .from('axk_wallet')
    .where('wallet_id', data);   
    return query;
};

exports.createBTC = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_btc').insert({
    wallet_id: data.wallet_id,
    wif: data.wif,
    address: data.address,
    index: 0,
    xpub: data.xpub,
    xpriv: data.xpriv,
    created_at: createdAt,
    updated_at: createdAt
  });
  console.info("query -->", query.toQuery())
  return query;
};

exports.getBTC = async (data) => {
  const query = db.read.select('*')
    .from('axk_btc')
    .where('wallet_id', data);   
    return query;
};

exports.checkBTC = async (data) => {
  const query = db.read.select('axk_btc.address', 'axk_btc.index')
    .from('axk_btc')
    .where('wallet_id', data);   
    return query;
};

exports.createEVM = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_evm').insert({
    wallet_id: data.wallet_id,
    address: data.address,
    index: data.index,
    created_at: createdAt,
    updated_at: createdAt
  });
  console.info("query -->", query.toQuery())
  return query;
};

exports.getEVM = async (data) => {
  const query = db.read.select('*')
    .from('axk_evm')
    .where('wallet_id', data)
    .orWhere('address', data);   
    return query;
};

exports.isEVM = async (data) => {
  const query = db.read.select('*')
    .from('axk_evm')
    .where('wallet_id', data)
    .orWhere('address', data);   
    return query;
};

exports.checkEVM = async (data) => {
  const query = db.read.select('axk_evm.index')
    .from('axk_evm')
    .where('wallet_id', data.wallet_id)
    .orWhere('address', data.address);   
    return query;
};

exports.createXRP = async (data) => {
  const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  const query = db.write('axk_xrp').insert({
    wallet_id: data.wallet_id,
    pubKey: data.pubKey,
    privKey: data.privKey,
    index : data.index || 0,
    address: data.address,
    balance: data.balance,
    created_at: createdAt,
    updated_at: createdAt
  });
  console.info("query -->", query.toQuery())
  return query;
};



exports.getXRP = async (data) => {
  const query = db.read.select('*')
    .from('axk_xrp')
    .where('wallet_id', data.wallet_id) 
    .where('address', data.address);  
    return query;
};

exports.getXRPWallet = async (wallet_id) => {
  const query = db.read.select('*')
    .from('axk_xrp')
    .where('wallet_id', wallet_id);  
    return query;
};

exports.checkXRP = async (data) => {
  const query = db.read.select('axk_xrp.address', 'axk_xrp.balance')
    .from('axk_xrp')
    .where('wallet_id', data.wallet_id)
    .where('address', data.address);  
    return query;
};

exports.isXRP = async (data) => {
  const query = db.read.select('axk_xrp.address', 'axk_xrp.balance')
    .from('axk_xrp')
    .where('wallet_id', data)
    .orWhere('address', data);  
    return query;
};

exports.createWif = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_btc_wif').insert({
      wallet_id: data.wallet_id,
      wif: data.wif,
      address: data.address,
      index: data.index || 0,
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.getWif = async (data) => {
    const query = db.read.select('*')
      .from('axk_btc_wif')
      .where('wallet_id', data.wallet_id)
      .where('address', data.address);   
      return query;
  };



  exports.checkWif = async (data) => {
    const query = db.read.select('axk_btc_wif.address', 'axk_btc_wif.index')
      .from('axk_btc_wif')
      .where('wallet_id', data)
      .orWhere('wif', data);   
      return query;
  };

  exports.getWifs = async (data) => {
    const query = db.read.select('*')
      .from('axk_btc_wif')
      .where('wallet_id', data);   
      return query;
  };

  exports.cryptoBalance = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_balance').insert({
      wallet_id: data.wallet_id,
      crypto: data.crypto,
      address: data.address,
      balance: data.balance || 0,
      usd: data.usd || 0,
      status: "pending",
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.deleteCryptoBalance = async (id) => {
    console.log("del to axk balance", id)
    const query = db.write('axk_balance')
    .from('axk_balance')
    .where('wallet_id', '=', id)
    .del()
    return query;
  };

  exports.evmBalance = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_evm_balance').insert({
      wallet_id: data.wallet_id,
      crypto: data.crypto,
      name : data.name,
      address: data.address,
      balance: data.balance || 0,
      usd: data.usd || 0,
      status: "pending",
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.checkBalance = async (data) => {
    const query = db.read.select('axk_balance.balance', 'axk_balance.usd' )
      .from('axk_balance')
      .where('wallet_id', data.wallet_id)
      .where('crypto', data.crypto)
      .where('address', data.address);   
      return query;
  };

  exports.checkEvmBalance = async (data) => {
    const query = db.read.select('axk_evm_balance.balance', 'axk_evm_balance.usd' )
      .from('axk_evm_balance')
      .where('wallet_id', data.wallet_id)
      .where('crypto', data.crypto)
      .where('address', data.address);   
      return query;
  };

  exports.getBalance = async (data) => {
    const query = db.read.select('*')
      .from('axk_balance')
      .where('wallet_id', data.wallet_id)
      .where('crypto', data.crypto)
      .where('address', data.address);   
      return query;
  };

  exports.getEvmBalance = async (data) => {
    const query = db.read.select('*')
      .from('axk_evm_balance')
      .where('wallet_id', data.wallet_id)
      .where('crypto', data.crypto)
      .where('address', data.address);   
      return query;
  };

  exports.updateBalance = async (data) => {
    const query = db.write('axk_balance')
      .where('wallet_id', data.wallet_id)
      .where('crypto', data.crypto)
      .where('address', data.address)
      .update({
        balance : data.balance,
        usd: data.usd,
        status: data.status,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.updateEvmBalance = async (data) => {
    const query = db.write('axk_evm_balance')
      .where('wallet_id', data.wallet_id)
      .where('crypto', data.crypto)
      .where('address', data.address)
      .update({
        balance : data.balance,
        usd: data.usd,
        status: data.status,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

exports.updateWalletPassphrase = async (data) => {
    const query = db.write('axk_wallet')
      .where('wallet_id', data.wallet_id)
      .update({
        passphrase: data.passphrase,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

exports.updateWallet = async (data) => {
    const query = db.write('axk_wallet')
      .where('wallet_id', data.wallet_id)
      .update({
        mnemonic: data.key,
        passphrase: data.passcode,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };


exports.updateBTC = async (data) => {
    const query = db.write('axk_btc')
      .where('wallet_id', data.wallet_id)
      .update({
        wif: data.wif,
        address: data.address,
        index: data.index,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.updateBTCKeys = async (data) => {
    const query = db.write('axk_btc')
      .where('wallet_id', data.wallet_id)
      .update({
        wif: data.wif_key,
        xpub: data.pub_key,
        xpriv: data.priv_key,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };
 
exports.updateEVMIndex = async (data) => {
    const query = db.write('axk_evm')
      .where('wallet_id', data.wallet_id)
      .where('address', data.wallet_id)
      .update({
        index: data.index,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.updateBTCWif = async (data) => {
    const query = db.write('axk_btc_wif')
      .where('wallet_id', data.wallet_id)
      .update({
        wif: data.wif,
        address: data.address,
        index: data.index,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

exports.updateXRP = async (data) => {
    const query = db.write('axk_xrp')
      .where('wallet_id', data.wallet_id)
      .update({
        pubKey: data.pubKey,
        privKey: data.privKey,
        index: data.index,
        address: data.address,
        balance: data.balance,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

exports.updateXRPKeys = async (data) => {
    const query = db.write('axk_xrp')
      .where('wallet_id', data.wallet_id)
      .update({
        pubKey: data.new_pub,
        privKey: data.new_priv,
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.btcSent = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_send_btc').insert({
      wallet_id: data.wallet_id,
      from: data.from,
      amount: data.amount,
      to: data.to,
      index: data.index,
      wif: data.wif,
      address: data.address,
      rawTx: data.rawTx,
      txHash: data.txHash,
      status: "pending",
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.btcSentTxs = async (data) => {
    const createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    const query = db.write('axk_btc_txs').insert({
      wallet_id: data.wallet_id,
      from: data.from,
      amount: data.amount,
      to: data.to,
      index: data.index,
      wif: data.wif,
      address: data.address,
      rawTx: data.rawTx,
      txHash: data.txHash,
      status: "pending",
      created_at: createdAt,
      updated_at: createdAt
    });
    console.info("query -->", query.toQuery())
    return query;
  };

  exports.updateBtcSentPush = async (txHash) => {
    const query = db.write('axk_btc_txs')
      .where('txHash', txHash)
      .update({
        status : "pushed",
        updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
      });
    console.info("query -->", query.toQuery())
    return query;
    };


    exports.updateBtcSentStatus = async (data) => {
      const query = db.write('axk_btc_txs')
        .where('wallet_id', data.wallet_id)
        .where('txHash', data.txHash)
        .update({
          status : data.status,
          updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
        });
      console.info("query -->", query.toQuery())
      return query;
      };
  
    exports.updateBtcSent = async (data) => {
        const query = db.write('axk_btc_txs')
          .where('wallet_id', data.wallet_id)
          .where('rawTx', data.rawTx)
          .update({
            status : data.status,
            updated_at : moment().format('YYYY-MM-DD HH:mm:ss')
          });
        console.info("query -->", query.toQuery())
        return query;
        };
    
    exports.fetchSentBtc = async (data) => {
        const query = db.read.select('*')
          .from('axk_btc_txs')
          .where('wallet_id', data.wallet_id)
          .where('rawTx', data.rawTx)
          .where('status', 'pushed');
              
          return query;
      }

      exports.fetchSentPending = async (data) => {
        const query = db.read.select('*')
          .from('axk_btc_txs')
          .where('wallet_id', data.wallet_id)
          .where('rawTx', data.rawTx)
          .where('status', 'pending')
          .orWhere('status', 'decoded');
              
          return query;
      }

      exports.fetchSentDecoded = async (data) => {
        const query = db.read.select('*')
          .from('axk_btc_txs')
          .where('wallet_id', data.wallet_id)
          .where('rawTx', data.rawTx)
          .where('status', 'decoded');
              
          return query;
      }

    exports.fetchSentBtcTx = async (data) => {
        const query = db.read.select('*')
          .from('axk_btc_txs')
          .where('wallet_id', data.wallet_id)
          .where('txHash', data.txHash);
              
          return query;
      }
    

    exports.fetchPushedBtcTx = async (data) => {
        const query = db.read.select('*')
          .from('axk_btc_txs')
          .where('wallet_id', data.wallet_id)
          .where('txHash', data.txHash)
          .where('status', 'pushed');    
          return query;
      }