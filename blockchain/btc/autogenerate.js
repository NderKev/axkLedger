const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32')
const bip39 = require('bip39')
const assert = require('assert');
require('dotenv').config();
//const express = require('express');
const { builtinModules } = require('module');

const testnet = bitcoin.networks.testnet;

const mainnet = bitcoin.networks.bitcoin;

//const router  = express.Router();
 /**  const {successResponse, errorResponse} = require('./lib/response');
   const logStruct = (func, error) => {
    return {'func': func, 'file': 'autogenerate', error}
  } **/

function get_p2sh_p2wpkh_address(node, network) {
	return bitcoin.payments.p2sh({
		redeem: bitcoin.payments.p2wpkh({ pubkey: node.publicKey, network }),
		network,
	}).address;
}

function get_p2pkh_address(node, network) {
	return  bitcoin.payments.p2pkh({ 
		pubkey: node.publicKey,
	    network 
	}).address;
}

function get_p2wpkh_address(node, network) {
	return  bitcoin.payments.p2wpkh({ 
		pubkey: node.publicKey,
	    network 
	}).address;
}

const paymentAddress = function (indexer, xPubKey) {
// This happens in the secure API
 // testnet is tpub not xpub

// This happens in the less-secure webserver
// The webserver must not store private keys
let index = indexer + 1; // whatever

// The webserver gets the accountXPub on startup via an API call
// const accountXPub = axios.get(.../accountxpub);
const webRoot = bip32.fromBase58(xPubKey, testnet);
const webserverChild = webRoot
	.derive(0)
	.derive(index);
console.log('webserverChild:', webserverChild)
const webserverChildAddress = get_p2sh_p2wpkh_address(webserverChild, testnet);
// send the child's address to the user for payment
console.log('webserverChild address:',  webserverChildAddress);
let new_payment = {};
new_payment.address = webserverChildAddress;
new_payment.index = index;
return new_payment;
}


const receivePaymentAddress = function(indexer, passphrase, key) {
let index = indexer + 1;
const seed = bip39.mnemonicToSeedSync(key, passphrase);
const root = bip32.fromSeed(seed, testnet);
const accountpath = "m/49'/1'/0'"; // 1' is testnet, change to 0' for mainnet
const account = root.derivePath(accountpath);
// The index gets sent together with the user's query to the API
// The API reconstructs the address, but it can also construct the private key
//let index = indexer + 1;
const APIChild = account
	.derive(0)
	.derive(indexer); // can now withdraw whatever the user paid
console.log('APIChild:', APIChild);
const recieveAddress = get_p2pkh_address(APIChild, testnet);
const privKey = APIChild.toWIF();
console.log('APIChild address:', recieveAddress);
console.log('APIChild.toWIF():', privKey)

//assert.strictEqual(getAddress(webserverChild, testnet), getAddress(APIChild, testnet)); // same public key
// but the webserver node doesn't have a private key
assert.throws(APIChild.toWIF);
let new_wallet = {};
new_wallet.address = recieveAddress;
new_wallet.wif = privKey;
new_wallet.index = index;

return new_wallet;
}
//This what we are invoking 
const receivePaymentAddressMain = function(indexer, passphrase, key) {
	//let index = key;
	const seed = bip39.mnemonicToSeedSync(key, passphrase);
	const root = bip32.fromSeed(seed, mainnet);
	const accountpath = "m/49'/0'/0'"; // 1' is testnet, change to 0' for mainnet
	const account = root.derivePath(accountpath);
	// The index gets sent together with the user's query to the API
	// The API reconstructs the address, but it can also construct the private key
	let index = indexer + 1;
	const APIChild = account
		.derive(0)
		.derive(index); // can now withdraw whatever the user paid
	console.log('APIChild:', APIChild);
	const recieveAddress = get_p2pkh_address(APIChild, mainnet);
	const privKey = APIChild.toWIF();
	console.log('APIChild address:', recieveAddress);
	console.log('APIChild.toWIF():', privKey)
	
	//assert.strictEqual(getAddress(webserverChild, testnet), getAddress(APIChild, testnet)); // same public key
	// but the webserver node doesn't have a private key
	assert.throws(APIChild.toWIF);
	let new_wallet = {};
	new_wallet.address = recieveAddress;
	new_wallet.wif = privKey;
	new_wallet.index = index;
	
	return new_wallet;
	}

const receiveP2WPKHPayment = function(indexer, passphrase, key) {
	//et mnemonic = key;
	const seed = bip39.mnemonicToSeedSync(key, passphrase);
	const root = bip32.fromSeed(seed, testnet);
	const accountpath = "m/49'/1'/0'"; // 1' is testnet, change to 0' for mainnet
	const account = root.derivePath(accountpath);
	// The index gets sent together with the user's query to the API
	// The API reconstructs the address, but it can also construct the private key
	//let index = indexer + 1;
	const APIChild = account
		.derive(0)
		.derive(indexer); // can now withdraw whatever the user paid
	console.log('APIChild:', APIChild);
	const recieveAddress = get_p2wpkh_address(APIChild, testnet);
	const privKey = APIChild.toWIF();
	console.log('APIChild address:', recieveAddress);
	console.log('APIChild.toWIF():', privKey)
	
	//assert.strictEqual(getAddress(webserverChild, testnet), getAddress(APIChild, testnet)); // same public key
	// but the webserver node doesn't have a private key
	assert.throws(APIChild.toWIF);
	let new_wallet = {};
	new_wallet.address = recieveAddress;
	new_wallet.wif = privKey;
	new_wallet.index = indexer;
	
	return new_wallet;
	}

const newP2SHP2WPKHAddress = function (indexer, xPubKey) {
	// This happens in the secure API
	 // testnet is tpub not xpub
	
	// This happens in the less-secure webserver
	// The webserver must not store private keys
	let index = indexer + 1; // whatever
	
	// The webserver gets the accountXPub on startup via an API call
	// const accountXPub = axios.get(.../accountxpub);
	const webRoot = bip32.fromBase58(xPubKey, testnet);
	const webserverChild = webRoot
		.derive(0)
		.derive(index);
	console.log('webserverChild:', webserverChild)
	const webserverChildAddress = get_p2sh_p2wpkh_address(webserverChild, testnet);
	// send the child's address to the user for payment
	console.log('webserverChild address:',  webserverChildAddress);
	let data = {}
	data.index = index;
	data.address = webserverChildAddress;
	return data;
	}

const newP2PKHAddress = function (indexer, xPubKey) {
		// This happens in the secure API
		 // testnet is tpub not xpub
		
		// This happens in the less-secure webserver
		// The webserver must not store private keys
		let index = indexer + 1; // whatever
		
		// The webserver gets the accountXPub on startup via an API call
		// const accountXPub = axios.get(.../accountxpub);
		const webRoot = bip32.fromBase58(xPubKey, testnet);
		const webserverChild = webRoot
			.derive(0)
			.derive(index);
		console.log('webserverChild:', webserverChild)
		const privKey = webserverChild.toWIF();
		const webserverChildAddress = get_p2pkh_address(webserverChild, testnet);
		// send the child's address to the user for payment
		console.log('webserverChild address:',  webserverChildAddress);
		let data = {}
		data.index = index;
		data.address = webserverChildAddress;
		data.wif = privKey;
		return data;
	}

	const newP2PKHAddressMain = function (indexer, xPubKey) {
		// This happens in the secure API
		 // testnet is tpub not xpub
		
		// This happens in the less-secure webserver
		// The webserver must not store private keys
		let index = indexer + 1; // whatever
		
		// The webserver gets the accountXPub on startup via an API call
		// const accountXPub = axios.get(.../accountxpub);
		const webRoot = bip32.fromBase58(xPubKey, mainnet);
		const webserverChild = webRoot
			.derive(0)
			.derive(index);
		console.log('webserverChild:', webserverChild)
		const privKey = webserverChild.toWIF();
		const webserverChildAddress = get_p2pkh_address(webserverChild, mainnet);
		// send the child's address to the user for payment
		console.log('webserverChild address:',  webserverChildAddress);
		let data = {}
		data.index = index;
		data.address = webserverChildAddress;
		data.wif = privKey;
		return data;
	}

	const newP2WPKHAddress = function (indexer, xPubKey) {
		// This happens in the secure API
		 // testnet is tpub not xpub
		
		// This happens in the less-secure webserver
		// The webserver must not store private keys
		let index = indexer + 1; // whatever
		
		// The webserver gets the accountXPub on startup via an API call
		// const accountXPub = axios.get(.../accountxpub);
		const webRoot = bip32.fromBase58(xPubKey, testnet);
		const webserverChild = webRoot
			.derive(0)
			.derive(index);
		console.log('webserverChild:', webserverChild)
		//const privKey = webserverChild.toWIF();
		const webserverChildAddress = get_p2wpkh_address(webserverChild, testnet);
		// send the child's address to the user for payment
		console.log('webserverChild address:',  webserverChildAddress);
		let data = {}
		data.index = index;
		data.address = webserverChildAddress;
		//data.wif = privKey;
		return data;
	}
	/** receivePaymentAddressMain(
	 0,
 "test@1234",
"category pass cruise creek upset young wage worry observe acid barely square"
	) **/

module.exports = {
    paymentAddress,
    receivePaymentAddress,
	receivePaymentAddressMain,
	receiveP2WPKHPayment,
	newP2SHP2WPKHAddress,
	newP2PKHAddress,
	newP2PKHAddressMain,
	newP2WPKHAddress
}
