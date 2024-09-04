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

const {abi} = require("../abi/ProduceTraceabilityV8.json");
const ProduceManagement = require("./ProduceManagement");
const contractAddress = contracts.ProduceTraceabilityV8;

const ProduceTraceabilityV8Contract = new web3.eth.Contract(abi, contractAddress);

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
    const tx = ProduceTraceabilityV8Contract.methods.registerFarmer(data.name, data.location, data.address);
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
    const tx = ProduceTraceabilityV8Contract.methods.verifyFarmer(data);
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
    data.lot_number = ProduceManagement.generateLotNumber(8);//ProduceManagement.generateUniqueLotNumber(16);
    data.storage_date = moment().format('YYYY/MM/DD');//moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(data);
    //const prod_hash = ProduceManagement.createHashFromInfo(data.farmer, data.lot_number, data.weight, data.storage_date);
    const tx = ProduceTraceabilityV8Contract.methods.addFarmProduce(data.produce, data.lot_number, data.weight, data.quantity, data.storage_date, data.farmer, data.agents);
    const add_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataAdd = {
      txHash : add_response.transactionHash,
      produce : data.produce,
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

// Function to add  farmer produce  
async function addProduct(data) { 
    //data.index = Math.floor(Math.random() * 9000000000) + 1000000000;
    const tx = ProduceTraceabilityV8Contract.methods.addProduct(data.farmer, data.lot_number, data.produce, data.storage_date);
    const add_prd_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataAddProd = {
      txHash : add_prd_response.transactionHash,
      farmer : data.farmer,
      lot_number : data.lot_number,
      produce : data.produce,
      storage_date : data.storage_date
    };
    return dataAddProd;
}

// Function to add  farmer produce  sale
async function sellFarmProduce(data) { 
    data.index = Math.floor(Math.random() * 9000000000) + 1000000000;
    data.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const tx = ProduceTraceabilityV8Contract.methods.sellFarmProduce(data.hash, data.index, data.buyer, data.amount, data.price, data.timestamp);
    const sell_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataSell = {
      txHash : sell_response.transactionHash,
      hash : data.hash,
      index : data.index,
      farmer : data.farmer,
      buyer : data.buyer,
      amount : data.amount,
      price : data.price,
      timestamp : data.timestamp
    };
    return dataSell;
}

// Function to get farmer details
async function getFarmer(data) {
    const farmer = await ProduceTraceabilityV8Contract.methods.getFarmer(data).call();
    return farmer;
}

// Function to get farmer produce details
async function getProduce(data) {
    const produce = await ProduceTraceabilityV8Contract.methods.getProduce(data).call();
    return produce;
}

// Function to get farmer produce hash
async function getProduceHash(data) {
    const prod_hash = await ProduceTraceabilityV8Contract.methods.getProduceHash(data.lot_number, data.farmer).call();
    return prod_hash;
}

// Function to get farmer produce index
async function getProduceIndex(data) {
    const index = await ProduceTraceabilityV8Contract.methods.getProduceIndex(data).call();
    return index;
}

// Function to get farmer produce sale
async function getProduceSale(data) {
    const prod_sale = await ProduceTraceabilityV8Contract.methods.getProduceSale(data).call();
    return prod_sale;
}

// Function to get farmer produce sale index
async function getProduceSaleIndex(data) {
    const sale = await ProduceTraceabilityV8Contract.methods.getProduceSaleIndex(data).call();
    return sale;
}

// Function to get farmer produce sale index
async function getConsignmentHash(data) {
    const hash = await ProduceTraceabilityV8Contract.methods.getConsignmentHash(data.lot_number, data.farmer).call();
    return hash;
}



// Function to get current produce consignment index
async function currentconsignment(data) {
    const hash = await ProduceTraceabilityV8Contract.methods.currentconsignment(data).call();
    return hash;
}

// Function to get current produce index
async function currentproduct(data) {
    const hash = await ProduceTraceabilityV8Contract.methods.currentproduct(data).call();
    return hash;
}
// Function to get current produce data
async function producedata(data) {
    const dt = await ProduceTraceabilityV8Contract.methods.producedata(data.hash).productData(data.ndex).call();
    return dt;
}

// Function to get current produce data
async function productdata(data) {
    const d_t = await ProduceTraceabilityV8Contract.methods.productdata(data).call();
    return d_t;
}

module.exports = {
    registerFarmer,
    verifyFarmer,
    addFarmProduce,
    addProduct,
    sellFarmProduce,
    getFarmer,
    getProduce,
    getProduceHash,
    getProduceIndex,
    getProduceSale,
    getProduceSaleIndex,
    getConsignmentHash,
    currentconsignment,
    currentproduct,
    producedata,
    productdata
}