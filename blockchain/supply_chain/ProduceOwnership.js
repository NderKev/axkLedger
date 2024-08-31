// Set up web3 with Lisk provider
const {Web3, HttpProvider} = require("web3");
const link_testnet_rpc = 'https://rpc.sepolia-api.lisk.com';
const {BigNumber} = require("bignumber.js");
//const provider = new Theta.providers.HttpProvider('https://eth-rpc-api-testnet.thetatoken.org/rpc');
const web3 = new Web3(link_testnet_rpc);
const chainId = 4202
const BN = require('bn.js');
const contracts = require("../abi/contracts");
const moment = require("moment");
require('dotenv').config({ path: '../../.env'});

const {abi} = require("../abi/ProduceOwnership.json");

const contractAddress = contracts.ProduceOwnership;

const ProduceOwnershipContract = new web3.eth.Contract(abi, contractAddress);

const privateKey = process.env.LISK_PRIV_KEY;
const fromAddress = process.env.SUPPLY_CHAIN_ADDRESS;

async function sendTransaction(tx, fromAddress, privateKey) {
    try {
        const gas = await tx.estimateGas({ from: fromAddress });
        console.log("gas :" + gas);
        const gasPrice = await web3.eth.getGasPrice();
        const count = await web3.eth.getTransactionCount(fromAddress);
        const txData = tx.encodeABI();
        const nonce = web3.utils.toHex(count);
        
        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data: txData,
                nonce: nonce,
                gas,
                gasPrice,
            },
            privateKey
        );

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log('Transaction receipt: ', receipt);
        return receipt;
    } catch (error) {
        console.error('Transaction error: ', error);
    }
}



// Function to register a farmer produce consignment 
async function addOwnership(data) { 
    const tx = ProduceOwnershipContract.methods.addOwnership(data.farmer, data.op_type, data.p_hash);
    const add_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataAdd = {
      txHash : add_response.transactionHash,
      //data : uint_hash,
      farmer : data.farmer,
      op : data.op_type,
      p_hash : data.p_hash
    };
    return dataAdd;
}

// Function to register  farmer produce  
async function changeOwnership(data) { 
    const tx = ProduceOwnershipContract.methods.changeOwnership(data.owner, data.op_type, data.p_hash, data.to);
    const change_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataChange = {
      txHash : change_response.transactionHash,
      owner : data.owner,
      op : data.op_type,
      p_hash : data.p_hash,
      to : data.to
    };
    return dataChange;
}

// Function to get current consignment owner
async function currentConsignmentOwner(data) {
    const consignment = await ProduceOwnershipContract.methods.currentConsignmentOwner(data).call();
    return consignment;
}

// Function to get current produce owner
async function currentProduceOwner(data) {
    const produce = await ProduceOwnershipContract.methods.currentProduceOwner(data).call();
    return produce;
}


module.exports = {
    addOwnership,
    changeOwnership,
    currentConsignmentOwner,
    currentProduceOwner
}