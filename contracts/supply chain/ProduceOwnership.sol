// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProduceManagement{
    struct Consignment{
        address farmer;
        string consz_lot_number;
        string consignment_weight;
        string creation_date;
    }

    struct Produce{
        address farmer;
        string consz_lot_number;
        string produce_type;
        string creation_date;
        bytes32[] consignments;
    }

    mapping(bytes32 => Consignment) public consignments;
    mapping(bytes32 => Produce) public produces;

    function getConsignments(bytes32 produce_hash) public returns (bytes32[6] memory) {}
}

contract ProduceOwnership {

    enum OperationType {UNIT, PRODUCE}
    mapping(bytes32 => address) public currentConsignmentOwner;
    mapping(bytes32 => address) public currentProduceOwner;

    event TransferConsignmentOwnership(bytes32 indexed p, address indexed account);
    event TransferProduceOwnership(bytes32 indexed p, address indexed account);
    ProduceManagement public pm;

    constructor(address prod_contract_addr) public {
        //Just create a new auxiliary contract. We will use it to check if the consignment or produce really exist
        pm = ProduceManagement(prod_contract_addr);
    }

    function addOwnership(uint op_type, bytes32 p_hash) public returns (bool) {
        bool retType = false;
        if(op_type == uint(OperationType.UNIT)){
            address farmer;
            (farmer, , , ) = pm.consignments(p_hash);
            require(currentConsignmentOwner[p_hash] == address(0), "Consignment was already registered");
            require(farmer == msg.sender, "Consignment was not made by requester");
            currentConsignmentOwner[p_hash] = msg.sender;
            emit TransferConsignmentOwnership(p_hash, msg.sender);
            retType = true;
        } else if (op_type == uint(OperationType.PRODUCE)){
            address farmer;
            (farmer, , , ) = pm.produces(p_hash);
            require(currentProduceOwner[p_hash] == address(0), "Produce was already registered");
            require(farmer == msg.sender, "Produce was not made by requester");
            currentProduceOwner[p_hash] = msg.sender;
            emit TransferProduceOwnership(p_hash, msg.sender);
            retType = true;
            
        }
        return retType;
    }

    function changeOwnership(uint op_type, bytes32 p_hash, address to) public returns (bool) {
      //Check if the element exists and belongs to the user requesting ownership change
        bool resType = false;
        if(op_type == uint(OperationType.UNIT)){
            require(currentConsignmentOwner[p_hash] == msg.sender, "Consignment is not owned by requester");
            currentConsignmentOwner[p_hash] = to;
            emit TransferConsignmentOwnership(p_hash, to);
            resType = true;

        } else if (op_type == uint(OperationType.PRODUCE)){
            require(currentProduceOwner[p_hash] == msg.sender, "Produce is not owned by requester");
            currentProduceOwner[p_hash] = to;
            emit TransferProduceOwnership(p_hash, to);
            //Change consignment ownership too
            bytes32[6] memory unit_list = pm.getConsignments(p_hash);
            for(uint i = 0; i < unit_list.length; i++){
                currentConsignmentOwner[unit_list[i]] = to;
                emit TransferConsignmentOwnership(unit_list[i], to);
            }
            resType = true;

        }
        return resType;
    }
}