const walletModel = require('../../server/psql/models/wallet');
const { check, validationResult } = require('express-validator');
const {validateToken, validateAdmin} = require('../../server/psql/middleware/auth');
const {authenticateUser, decryptPrivKey, authenticatePin} = require('../../server/psql/controllers/auth');
const EurcToken = require('../abi/EurcToken');
const contracts = require('../abi/contracts');
const { Web3 }  = require('web3');
const provider = require('../eth/libs/provider');
const httpProvider = new Web3.providers.HttpProvider(provider.sepolia);
const web3 = new Web3(httpProvider);
const EurcContract = new web3.eth.Contract(EurcToken, contracts.EurcToken);
//const EurcSmartContract = 
const router  = express.Router();

const balanceEurcToken = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    try{  
      const bal_eurc = await EurcContract.methods.balanceOf(req.body.address).call();
      console.log( "balance: " + bal_eurc);
      //bal_eth 
      const bal_eurc_wei = Number(bal_eurc.toString());
      console.log(bal_eurc_wei);
      const eurc_wei = bal_eurc_wei * Math.pow(10, -18);
      console.log(eurc_wei); 
      //const bal_axk = await axkToken.balanceOf(req.body.address);
      const balance = {
         wallet_id : req.user.wallet_id,
         balance : eurc_wei
      }
      return res.send({balance: balance}); //successResponse(200, bal_axk, 'balance'); 
    } catch (error) {
    console.error('error -> ', logStruct('balanceAxkToken', error))
    return res.send(error.status);
  }
  }

  router.post('/balance', validateToken,  [
    check('wallet_id', 'Please include the wallet id').isAlphanumeric().not().isEmpty(),
    check('address', 'User address is required').isEthereumAddress().not().isEmpty()
  ], async(req, res, next) => {
    const balance = await balanceEurcToken(req, res);
    return balance;
});




module.exports = router;