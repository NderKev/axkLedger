// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./ProduceOwnership.sol";
import "./ProduceManagement.sol";

contract ProduceTraceabilityV1  {
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
    }

    mapping(address => Farmer) public farmers;
    mapping(bytes32 => uint256) public lookUpProd;
    mapping(address => bytes32) public isProduce;
    mapping(uint256 => uint256) public lookUpSale;
    address[] public FarmerAddresses;
    
    FarmProduce[] public FarmProduces;
    ProduceSale[] public ProduceSales;
    address public owner;
    //address public produce_management_contract = "0xFE8dc8cCC0CbB71B55e5008e5401079DF72B429c";
    ProduceOwnership public pwn;
    ProduceManagement public pmg;


    event ProduceAdded(address indexed farmer, bytes32 produce_hash, string produce_name, uint256 timestamp);
    event FarmerRegistered(string name, address indexed ethAddress, uint256 timestamp);
    event FarmerVerified(address indexed ethAddress, uint256 timestamp);
    event ProduceSold(address indexed source, bytes32 produce_hash , uint256 referenceNumber, uint256 timestamp);

    constructor(address prod_own_addr, address prod_mgmt_addr ) { //address prod_mgmt_addr
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
        string memory _produce_name,
        string memory _lot_number,
        string memory _weight,
        uint256 _quantity,
        string memory _storage_date,
        address _farmer,
        address[] memory _agents
    ) public  onlyOwner onlyFarmer(_farmer) returns(bytes32) {
        //pmg = ProduceManagement(produce_management_contract);
        bytes32 _produceHash = pmg.registerConsignment(_farmer, _lot_number, _weight, _storage_date);
        //pwn.pm.registerProduce()
        FarmProduce memory newProduct = FarmProduce({
            produceHash: _produceHash,
            produce: _produce_name,
            farmer: _farmer,
            quantity: _quantity,
            agents: _agents
        });

        FarmProduces.push(newProduct);
        pwn.addOwnership(_farmer, 1, _produceHash);
        uint256 index = getProduceCount();
        lookUpProd[_produceHash] = index - 1;
        isProduce[_farmer] = _produceHash;
        emit ProduceAdded(_farmer, _produceHash, _produce_name, block.timestamp);
        return _produceHash;
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
        bytes32 _produceHash,
        uint256 _referenceNumber,
        address _farmer,
        address _buyer,
        uint256 _amount,
        uint256 _price   
    ) public  onlyFarmer(_farmer) {
        require(_buyer != address(0), "Buyer address invalid");
        require(isProduce[_farmer] == _produceHash, "Only farmer's products may be sold");
        uint256 index = getProduceIndex(_produceHash);
        uint256 _quantity = FarmProduces[index].quantity;
        require(_amount <= _quantity, "Insufficient produce to sell");
        ProduceSale memory newSale = ProduceSale({
            consignmentHash: _produceHash,
            referenceNumber: _referenceNumber,
            buyer: _buyer,
            amount: _amount,
            price: _price
        });
        
        ProduceSales.push(newSale);
        pwn.changeOwnership(_farmer, 1, _produceHash, _buyer);
        FarmProduces[index].quantity -= _amount;
        uint256 counter = getProduceSaleCount();
        lookUpSale[_referenceNumber] = counter - 1;
        emit ProduceSold(_farmer, _produceHash, _referenceNumber, block.timestamp);
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
        return lookUpProd[_produceHash];
    }

    function getProduceSaleIndex(uint256 _referenceNumber) public view returns (uint256) {  
        return lookUpSale[_referenceNumber];
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