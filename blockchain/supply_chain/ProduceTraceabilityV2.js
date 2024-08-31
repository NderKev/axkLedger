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

const {abi} = require("../abi/ProduceTraceabilityV4.json");
const ProduceManagement = require("./ProduceManagement");
const contractAddress = contracts.ProduceTraceabilityV4;

const ProduceTraceabilityV4Contract = new web3.eth.Contract(abi, contractAddress);

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




// Function to register a farmer  
async function registerFarmer(data) { 
    const tx = ProduceTraceabilityV4Contract.methods.registerFarmer(data.name, data.location, data.address);
    const register_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataReg = {
      txHash : register_response.transactionHash,
      name : data.name,
      location : data.location,
      address : data.address
    };
    return dataReg;
}

// Function to verify a  farmer  
async function verifyFarmer(data) { 
    const tx = ProduceTraceabilityV4Contract.methods.verifyFarmer(data);
    const verify_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataVer = {
      txHash : verify_response.transactionHash,
      farmer : data
    };
    return dataVer;
}

// Function to add  farmer produce  
async function addFarmProduce(data) { 
    //data.index = Math.floor(Math.random() * 9000000000) + 1000000000;
    data.lot_number = ProduceManagement.generateUniqueLotNumber(16);
    data.storage_date = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(data);
    //const prod_hash = ProduceManagement.createHashFromInfo(data.farmer, data.lot_number, data.weight, data.storage_date);
    const tx = ProduceTraceabilityV4Contract.methods.addFarmProduce(data.produce, data.lot_number, data.weight, data.quantity, data.storage_date, data.farmer, data.agents);
    const add_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataAdd = {
      txHash : add_response.transactionHash,
      hash : prod_hash,
      farmer : data.farmer,
      lot_number : data.lot_number,
      weight : data.weight,
      quantity : data.quantity,
      storage_date : data.storage_date,
      farmer : data.farmer,
      agents : data.agents
    };
    return dataAdd;
}

// Function to add  farmer produce  sale
async function sellFarmProduce(data) { 
    data.index = Math.floor(Math.random() * 9000000000) + 1000000000;
    const tx = ProduceTraceabilityV4Contract.methods.sellFarmProduce(data.hash, data.index, data.farmer, data.buyer, data.amount, data.price);
    const sell_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataSell = {
      txHash : sell_response.transactionHash,
      hash : data.hash,
      index : data.index,
      farmer : data.farmer,
      buyer : data.buyer,
      amount : data.amount,
      price : data.price
    };
    return dataSell;
}

// Function to get farmer details
async function getFarmer(data) {
    const farmer = await ProduceTraceabilityV4Contract.methods.getFarmer(data).call();
    return farmer;
}

// Function to get farmer produce details
async function getProduce(data) {
    const produce = await ProduceTraceabilityV4Contract.methods.getProduce(data).call();
    return produce;
}

// Function to get farmer produce index
async function getProduceIndex(data) {
    const index = await ProduceTraceabilityV4Contract.methods.getProduceIndex(data).call();
    return index;
}

// Function to get farmer produce sale
async function getProduceSale(data) {
    const prod_sale = await ProduceTraceabilityV4Contract.methods.getProduceSale(data).call();
    return prod_sale;
}

// Function to get farmer produce sale index
async function getProduceSaleIndex(data) {
    const sale = await ProduceTraceabilityV4Contract.methods.getProduceSaleIndex(data).call();
    return sale;
}

// Function to get current produce consignment index
async function currentconsignment(data) {
    const hash = await ProduceTraceabilityV4Contract.methods.currentconsignment(data).call();
    return hash;
}

// Function to get current produce index
async function currentproduct(data) {
    const hash = await ProduceTraceabilityV4Contract.methods.currentproduct(data).call();
    return hash;
}

module.exports = {
    registerFarmer,
    verifyFarmer,
    addFarmProduce,
    sellFarmProduce,
    getFarmer,
    getProduce,
    getProduceIndex,
    getProduceSale,
    getProduceSaleIndex,
    currentconsignment,
    currentproduct
}