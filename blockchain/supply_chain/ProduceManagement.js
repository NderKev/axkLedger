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

const {abi} = require("../abi/ProduceManagement.json");

const contractAddress = contracts.ProduceManagement;

const ProduceManagementContract = new web3.eth.Contract(abi, contractAddress);

const privateKey = process.env.LISK_PRIV_KEY;
const fromAddress = process.env.SUPPLY_CHAIN_ADDRESS;
//const ProduceOwnershipV2 = require('./ProduceOwnershipV2');

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


const generateUniqueLotNumber = (length)=> {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let lot_num = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        lot_num += characters[randomIndex];
    }
    return lot_num;
  }

  const generateLotNumber = (length)=> {
    const characters = '0123456789';
    let lot_num = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        lot_num += characters[randomIndex];
    }
    let date = moment().format('YYYY/MM/DD');
    console.log(date);
    return lot_num;
  }


// Function to create produce hash for products and consignments
async function createHashFromInfo(address, s1, s2, s3) { 
    //data.consz_lot_number = generateUniqueLotNumber(16);
    //data.creation_date = moment().format('YYYY-MM-DD HH:mm:ss');
    const hash = await ProduceManagementContract.methods.createHashFromInfo(address, s1, s2, s3).call();
    //const hash_response = await sendTransaction(tx, fromAddress, privateKey);
    return hash;
}

// Function to register a farmer produce consignment 
async function registerConsignment(data) { 
    data.lot_number = generateLotNumber(8);
    data.creation_date = moment().format('YYYY/MM/DD');//moment().format('YYYY-MM-DD HH:mm:ss');
    const uint_hash = await createHashFromInfo(data.farmer, data.lot_number, data.weight, data.creation_date);
    const tx = ProduceManagementContract.methods.registerConsignment(data.farmer, data.lot_number, data.weight, data.creation_date);
    const register_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataReg = {
      txHash : register_response.transactionHash,
      uint_hash : uint_hash,
      farmer : data.farmer,
      consigment : data.lot_number,
      weight : data.weight,
      creation_date : data.creation_date
    };
    return dataReg;
}

// Function to register  farmer produce  
async function registerProduce(data) { 
    let produce_part = [];
    data.lot_number = generateLotNumber(10);
    data.creation_date = moment().format('YYYY/MM/DD');
    const produce_name = web3.utils.soliditySha3(data.farmer, web3.utils.fromAscii(data.lot_number), web3.utils.fromAscii(data.produce_type), web3.utils.fromAscii(data.creation_date));
    const lote_hash = web3.utils.soliditySha3(data.farmer, web3.utils.fromAscii(data.lot_number));
    const creation_date_hash = web3.utils.soliditySha3(data.farmer, web3.utils.fromAscii(data.creation_date));
    const produce_type_hash = web3.utils.soliditySha3(data.farmer, web3.utils.fromAscii(data.produce_type));
    const produce_hash = await createHashFromInfo(data.farmer, data.lot_number, data.produce_type, data.creation_date);
    //data.uint_array = uint_array;
    produce_part.push(data.hash, data.hash, data.hash, data.hash, data.hash, data.hash);
    data.uint_array = produce_part;
    //data.produce_hash = produce_hash;
    console.log(produce_hash);
    console.log(data);
    //const produce_hash = await ProduceManagement.createHashFromInfo(data.farmer, data.lot_number, data.produce_type, data.storage_date).call();
    const tx = ProduceManagementContract.methods.registerProduce(data.farmer, data.lot_number, data.produce_type, data.creation_date, data.uint_array);
    const register_produce_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataRegProd = {
      txHash : register_produce_response.transactionHash,
      uint_array : produce_part,
      produce_hash : produce_hash,
      farmer : data.farmer,
      lot_number : data.lot_number,
      produce_type : data.produce_type,
      creation_date : data.creation_date
    };
    return dataRegProd;
}

// Function unit produce consignments
async function consignments(data) {
    const consigment = await ProduceManagementContract.methods.consignments(data).call();
    return consigment;
}

// Function bulk produce consignments
async function getConsignments(data) {
    const consigments = await ProduceManagementContract.methods.getConsignments(data).call();
    return consigments;
}


module.exports = {
    createHashFromInfo,
    registerConsignment,
    registerProduce,
    consignments,
    getConsignments,
    generateUniqueLotNumber,
    generateLotNumber
}