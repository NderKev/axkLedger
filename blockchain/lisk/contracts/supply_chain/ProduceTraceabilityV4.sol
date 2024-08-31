// SPDX-License-Identifier: MIT
// https://sepolia-blockscout.lisk.com/address/0xd986aE2aea8bcb18129fF63A6f021DbC7Cc88677#code
pragma solidity ^0.8.24;
import "./ProduceOwnershipV1.sol";
import "./ProduceManagement.sol";

contract ProduceTraceabilityV4  {
    struct FarmProduce {
        bytes32 produceHash;
        string produce;
        address farmer;
        uint256 quantity;
        address[] agents; // List of blockchain agents where data is recorded
    }

    struct Farmer {
        string name;
        string location;
        address ethAddress;
        bool isVerified;
    }

    struct ProduceSale {
        bytes32 consignmentHash;
        uint256 referenceNumber;
        address buyer;
        uint256 amount;
        uint256 price;
        string time;
    }

    mapping(address => Farmer) public farmers;
    mapping(bytes32 => uint256) public productindex;
    mapping(bytes32 => FarmProduce) public farmproduct;
    mapping(uint256 => uint256) public saleindex;
    mapping(bytes32 => ProduceSale) public productsales;
    mapping (address => bytes32) public currentconsignment;
    mapping (bytes32 => bytes32) public currentproduct;

    address[] public FarmerAddresses;

    FarmProduce[] public FarmProduces;
    ProduceSale[] public ProduceSales;
    address public owner;
    ProduceOwnershipV1 public prown;
    ProduceManagement public promg;

    event ProduceAdded(address indexed farmer, bytes32 produce_hash, string produce_name, uint256 timestamp);
    event FarmerRegistered(string name, address indexed ethAddress, uint256 timestamp);
    event FarmerVerified(address indexed ethAddress, uint256 timestamp);
    event ProduceSold(address indexed source, bytes32 produce_hash , uint256 referenceNumber, uint256 timestamp);

    constructor(address prod_own_address, address prod_mgmt_address) { //address prod_mgmt_addr
        owner = msg.sender;
        prown = ProduceOwnershipV1(prod_own_address);
        promg = ProduceManagement(prod_mgmt_address);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyFarmer(address _farmer) {
        require(farmers[_farmer].isVerified == true, "Only the farmer can sell this product");
        _;
    }


    function addFarmProduce(
        string memory _produce_name,
        string memory _lot_number,
        string memory _weight,
        uint256 _quantity,
        string memory _storage_date,
        address _farmer,
        address[] memory _agents
    ) public  onlyOwner onlyFarmer(_farmer) {
        bytes32 _consignmentHash = addConsignment(_farmer, _lot_number, _weight, _storage_date);
        bytes32 _produceHash = addProduct(_farmer, _lot_number, _produce_name, _weight, _storage_date);
        FarmProduce memory newProduct = FarmProduce({
            produceHash: _produceHash,
            produce: _produce_name,
            farmer: _farmer,
            quantity: _quantity,
            agents: _agents
        });

        FarmProduces.push(newProduct);
        uint256 index = getProduceCount();
        if (index > 0){
            index -= 1;
        }
        productindex[_produceHash] = index;
        farmproduct[_produceHash].produceHash = _produceHash;
        farmproduct[_produceHash].farmer = _farmer;
        productsales[_consignmentHash].consignmentHash = _consignmentHash;
        currentproduct[_consignmentHash] = _produceHash;
        emit ProduceAdded(_farmer, _produceHash, _produce_name, block.timestamp);
    }
    
    function registerFarmer(string memory _name, string memory _location,  address _ethAddress) public {
        require(_ethAddress != address(0), "Farmer address invalid");
        Farmer memory newFarmer = Farmer({
            name: _name,
            location : _location,
            ethAddress: _ethAddress,
            isVerified: false
        });

        farmers[_ethAddress] = newFarmer;
        FarmerAddresses.push(_ethAddress);

        emit FarmerRegistered(_name, _ethAddress, block.timestamp);
    }

    function verifyFarmer(address _ethAddress) public onlyOwner {
        require(farmers[_ethAddress].ethAddress != address(0), "Farmer not registered");
        farmers[_ethAddress].isVerified = true;

        emit FarmerVerified(_ethAddress, block.timestamp);
    }

    function sellFarmProduce(
        bytes32 _consignmentHash,
        uint256 _referenceNumber,
        address _buyer,
        uint256 _amount,
        uint256 _price,
        string memory _timestamp  
    ) public {
        bytes32 prod_hash = currentproduct[_consignmentHash];
        address _farmer = farmproduct[prod_hash].farmer;
        require(_buyer != address(0) && _farmer != address(0), "Buyer or Farmer address invalid");
        uint256 index = getProduceIndex(prod_hash);
        uint256 _quantity = FarmProduces[index].quantity;
        require(_amount <= _quantity, "Insufficient produce to sell");
        ProduceSale memory newSale = ProduceSale({
            consignmentHash: _consignmentHash,
            referenceNumber: _referenceNumber,
            buyer: _buyer,
            amount: _amount,
            price: _price,
            time : _timestamp
        });
        
        ProduceSales.push(newSale);
        prown.changeOwnership(_farmer, 0, _consignmentHash, _buyer);
        FarmProduces[index].quantity -= _amount;
        uint256 counter = getProduceSaleCount();
        if (counter > 0){
            counter -= 1;
        }
        saleindex[_referenceNumber] = counter;
        productsales[_consignmentHash].referenceNumber = _referenceNumber;
        productsales[_consignmentHash].buyer = _buyer;
        productsales[_consignmentHash].amount = _amount;
        productsales[_consignmentHash].price = _price;
        productsales[_consignmentHash].time = _timestamp;

        emit ProduceSold(_farmer, _consignmentHash, _referenceNumber, block.timestamp);
    }

    // Function to convert certain struct fields to bytes32 array
    function structToBytes32Array(address farmer, string memory lot_number, string memory weight, string memory storage_date) onlyFarmer(farmer) public view returns (bytes32[6] memory) {
        bytes32 produce_hash = currentconsignment[farmer];
        bytes32 product_hash = currentproduct[produce_hash];
        address _farmer = farmproduct[product_hash].farmer;
        require(farmer == _farmer , "farmer address or consignment hash invalid");
        bytes32[6] memory result;
        uint256 index = getProduceCount();
        if (index > 0){
            index -= 1;
        }
        result[0] = bytes32(index);
        result[1] = produce_hash;
        result[2] = bytes32(uint256(uint160(farmer)));// Convert address to bytes32
        result[3] = keccak256(abi.encodePacked(lot_number));
        result[4] = keccak256(abi.encodePacked(weight));
        result[5] = keccak256(abi.encodePacked(storage_date));

        return result;
    }
  
   function addProduct(address farmer, string memory lot_number, string memory produce, string memory weight, string memory storage_date) public onlyFarmer(farmer) returns(bytes32) {
        bytes32[6] memory produce_hash = structToBytes32Array(farmer, lot_number, weight, storage_date);
        bytes32 produceHash = promg.registerProduce(farmer, lot_number, produce, storage_date, produce_hash);
        pwn.addOwnership(farmer, 1, produceHash);
        return produceHash;
    }
   
   function addConsignment(address farmer, string memory lot_number, string memory weight, string memory storage_date) public onlyFarmer(farmer) returns(bytes32) {
        bytes32 consignmentHash = promg.registerConsignment(farmer, lot_number, weight, storage_date);
        pwn.addOwnership(farmer, 0, consignmentHash);
        currentconsignment[farmer] = consignmentHash;
        return consignmentHash;
    }

    function getFarmerCount() public view returns (uint256) {
        return FarmerAddresses.length;
    }

    function getFarmer(address _ethAddress) public view returns (string memory, string memory, address, bool) {
        return (farmers[_ethAddress].name, farmers[_ethAddress].location, farmers[_ethAddress].ethAddress, farmers[_ethAddress].isVerified);
    }

    function getProduceCount() public view returns (uint256) {
        return FarmProduces.length;
    }

    function getProduce(uint256 index) public view returns (bytes32, string memory, address, uint256, address[] memory) {
        require(index < FarmProduces.length, "Invalid index");
    
        FarmProduce storage Produce = FarmProduces[index];
        return (Produce.produceHash, Produce.produce, Produce.farmer, Produce.quantity, Produce.agents);
    }

    function getProduceIndex(bytes32 _produceHash) public view returns (uint256) {  
        return productindex[_produceHash];
    }

    function getProduceSaleIndex(uint256 _referenceNumber) public view returns (uint256) {  
        return saleindex[_referenceNumber];
    }
    
    function getProduceSale(uint256 index) public view returns (bytes32, uint256, address, uint256, uint256) {
        require(index < ProduceSales.length, "Invalid index");
    
        ProduceSale storage Sale = ProduceSales[index];
        return (Sale.consignmentHash, Sale.referenceNumber, Sale.buyer, Sale.amount, Sale.price);
    }

    function getProduceSaleCount() public view returns (uint256) {
        return ProduceSales.length;
    }
    
}
 