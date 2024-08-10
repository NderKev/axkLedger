const { Web3 } = require("web3");
const contracts = require('../abi/contracts');
const fs = require("fs");
const path = require('path');
const { abi } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../abi/axkTokenV1.json')));
require('dotenv').config();
//const  = process.env.;
const eth_priv_key =  Buffer.from(process.env.PRIVATE_KEY, 'hex');

async function init() {
  // Configuring the connection to the Polygon node
  const network = "amoy";
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://polygon-amoy.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    ),
  );
  // Creating a signing account from a private key
  const signer = web3.eth.accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY,
  );

  web3.eth.accounts.wallet.add(signer);
 
  const contract = new web3.eth.Contract(abi, contracts.axkToken);
  //web3.eth.accounts.wallet.add(signer);
  const axk_token_init = await contract.methods.call(signer.address).encodeABI();
  // Creating the transaction object
  const tx = {
    from: signer.address,
    to: contracts.axkToken,
    data : axk_token_init,
    value: "0x0",
    gasPrice: "100000000000"
  };
  // Assigning the right amount of gas
  const gas_estimate = await web3.eth.estimateGas(tx);
  tx.gas = gas_estimate;
  //tx.gas = await web3.eth.estimateGas(tx);

  const signedTx = await web3.eth.accounts.signTransaction(tx, signer.privateKey);
  console.log("Raw transaction data: " + ( signedTx).rawTransaction);
  // Sending the transaction to the network
  const receipt = await web3.eth
    .sendSignedTransaction(signedTx.rawTransaction)
    .once("transactionHash", (txhash) => {
      console.log(`Mining transaction ...`);
      console.log(`https://${network}.polygonscan.com/tx/${txhash}`);
    });
  // The transaction is now on chain!
  console.log(`Mined in block ${receipt.blockNumber}`);
}

//require("dotenv").config();
init();