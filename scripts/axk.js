const { ethers, upgrades } = require("hardhat");

async function main() {
    // Get the contract to deploy

//const [deployer] = await ethers.getSigners();

//console.log("Deploying contracts with the account:", deployer.address);

//const initialOwner = deployer.address;
//const balance = await deployer.getBalance();
//console.log("Account balance:", balance.toString());
const AxkToken = await ethers.getContractFactory("AxkToken");

 console.log("Deploying AxkToken V1...");

 const axkToken = await upgrades.deployProxy(AxkToken, []);
// await axkToken.deployed();
  await axkToken.waitForDeployment();
 console.log("Axk Token v1 deployed to:", axkToken.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });