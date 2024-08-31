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
    data.consz_lot_number = generateUniqueLotNumber(16);
    data.creation_date = moment().format('YYYY-MM-DD HH:mm:ss');
    const uint_hash = await createHashFromInfo(data);
    const tx = ProduceManagementContract.methods.registerConsignment(data.farmer, data.consz_lot_number, data.consignment_weight, data.creation_date);
    const register_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataReg = {
      txHash : register_response.transactionHash,
      data : uint_hash,
      farmer : data.farmer,
      consigment : data.consz_lot_number,
      weight : data.consignment_weight,
      date : data.creation_date
    };
    return dataReg;
}

// Function to register  farmer produce  
async function registerProduce(data) { 
    data.consz_lot_number = generateUniqueLotNumber(16);
    data.creation_date = moment().format('YYYY-MM-DD HH:mm:ss');
    const uint_array = await createHashFromInfo(data);
    data.uint_array = uint_array;

    const tx = ProduceManagementContract.methods.registerProduce(data.farmer, data.consz_lot_number, data.produce_type, data.creation_date, data.uint_array);
    const register_produce_response = await sendTransaction(tx, fromAddress, privateKey);
    let dataRegProd = {
      txHash : register_produce_response.transactionHash,
      data : uint_array,
      farmer : data.farmer,
      consigment : data.consz_lot_number,
      type : data.produce_type,
      date : data.creation_date
    };
    return dataRegProd;
}

// Function unit produce consignments
async function consigments(data) {
    const consigment = await ProduceManagementContract.methods.consigments(data).call();
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
    consigments,
    getConsignments,
    generateUniqueLotNumber
}