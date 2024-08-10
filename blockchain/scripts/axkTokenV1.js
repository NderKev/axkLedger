const { ethers, upgrades } = require("hardhat");

async function main() {
    // Get the contract to deploy

const [deployer] = await ethers.getSigners();

console.log("Deploying contracts with the account:", deployer.address);

const initialOwner = deployer.address;
const balance = await deployer.getBalance();
console.log("Account balance:", balance.toString());
const AxkTokenV2 = await ethers.getContractFactory("axkTokenV2");

 console.log("Deploying AxkToken V1...");

 const axkTokenV2 = await upgrades.deployProxy(AxkTokenV2, [initialOwner], {
   initializer: "initialize",
 });
 await axkTokenV2.deployed();

 console.log("Axk Token v1 deployed to:", axkTokenV2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  