// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./ProduceOwnership.sol";


contract ProduceTraceabilityV1 {
    struct FarmProduce {
        bytes32 produceHash;
        string producer;
        string quality;
        string storageDuration;
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
        bytes32 produceHash;
        bytes32 shipmentHash;
        bytes32 customerHash;
        uint256 referenceNumber;
    }

    mapping(address => Farmer) public farmers;
    mapping(bytes32 => uint256) public lookUpProd;
    mapping(address => bytes32) public isProduce;
    mapping(uint256 => uint256) public lookUpSale;
    address[] public FarmerAddresses;

    FarmProduce[] public FarmProduces;
    ProduceSale[] public ProduceSales;
    address public owner;
    ProduceOwnership public pwn;
    ProduceManagement public pmg;

    event ProduceAdded(string produce, string producer, address indexed farmer, bytes32 produce_hash);
    event FarmerRegistered(string name, address indexed ethAddress, bytes32 farmer_hash);
    event FarmerVerified(address indexed ethAddress, uint256 blockNumber);
    event ProduceSold(address indexed source, bytes32 produce_hash , bytes32 customerHash, bytes32 consignment_hash);

    constructor(address prod_own_addr, address prod_mgmt_addr) {
        owner = msg.sender;
        pwn = ProduceOwnership(prod_own_addr);
        pmg = ProduceManagement(prod_mgmt_addr);
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
        string memory _produceName,
        string memory _producer,
        string memory _quality,
        string memory _storageDuration,
        address _farmer,
        address[] memory _agents
    ) public onlyOwner onlyFarmer(_farmer) returns(bytes32) {
        bytes32 _produceHash = pwn.pm.createHashFromInfo(_farmer, _producer, _produceName, _quality);
        FarmProduce memory newProduct = FarmProduce({
            produceHash: _produceHash,
            producer: _producer,
            quality: _quality,
            storageDuration: _storageDuration,
            agents: _agents
        });

        FarmProduces.push(newProduct);
        uint256 index = FarmProduces.length;
        lookUpProd[_produceHash] = index - 1;
        isProduce[_farmer] = _produceHash;
        emit ProduceAdded(_produceName, _producer, _farmer, block.number);
    }
    
    function registerFarmer(string memory _name, string memory _location,  address _ethAddress) public {
        Farmer memory newFarmer = Farmer({
            name: _name,
            location : _location,
            ethAddress: _ethAddress,
            isVerified: false
        });

        farmers[_ethAddress] = newFarmer;
        FarmerAddresses.push(_ethAddress);

        emit FarmerRegistered(_name, _ethAddress, block.number);
    }

    function verifyFarmer(address _ethAddress) public onlyOwner {
        require(farmers[_ethAddress].ethAddress != address(0), "Farmer not registered");
        farmers[_ethAddress].isVerified = true;

        emit FarmerVerified(_ethAddress, block.number);
    }

    function sellFarmProduce(
        uint256 _index,
        string memory _source,
        string memory _name,
        uint256 _quantity,
        uint256 _price,
        address _farmer
    ) public onlyOwner onlyFarmer(_farmer){
        bytes32 bytesProduceName = keccak256(abi.encodePacked(_name));
        require(isProduce[_farmer] == bytesProduceName, "Only farmer's products may be sold");
        ProduceSale memory newSale = ProduceSale({
            index: _index,
            source: _farmer,
            name: _name,
            farmer: _source,
            price: _price,
            quantity: _quantity
        });
        
        ProduceSales.push(newSale);
        uint256 counter = ProduceSales.length;
        lookUpSale[_index] = counter - 1;
        emit ProduceSold(_farmer, _name, _price, block.number);
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

    function getProduce(uint256 index) public view returns (string memory, string memory, string memory, string memory, address, address[] memory) {
        require(index < FarmProduces.length, "Invalid index");
    
        FarmProduce storage Produce = FarmProduces[index];
        return (Produce.produceName, Produce.producer, Produce.quality, Produce.storageDuration,  Produce.farmer, Produce.agents);
    }

    function getProduceIndex(string memory _produceName) public view returns (uint256) {  
        return lookUpProd[keccak256(abi.encodePacked(_produceName))];
    }

    function getProduceSaleIndex(uint256 index) public view returns (uint256) {  
        return lookUpSale[index];
    }
    
    function getProduceSale(uint256 index) public view returns (uint256, address, string memory, string memory, uint256, uint256) {
        require(index < ProduceSales.length, "Invalid index");
    
        ProduceSale storage Sale = ProduceSales[index];
        return (Sale.index, Sale.source, Sale.name, Sale.farmer, Sale.price, Sale.quantity);
    }

    function getProduceSaleCount() public view returns (uint256) {
        return ProduceSales.length;
    }
    
}