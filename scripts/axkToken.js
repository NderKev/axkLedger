async function initialize() {
    // Get the contract to deploy
    const hre = require("hardhat");
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const balance = await deployer.getBalance();
    console.log("Account balance:", balance.toString());
    const contractAddress = "0xfe8dc8ccc0cbb71b55e5008e5401079df72b429c";
    //const axkToken = await hre.ethers.getContractAt("axkToken", contractAddress);
    const axkToken = await ethers.getContractFactory('axkToken')
    const AxKToken = await axkToken.attach(contractAddress)
    // signer = await ethers.getSigners();

    // axxToken = await factory.attach('0xfe8dc8ccc0cbb71b55e5008e5401079df72b429c')
    const initContract = await axkToken.initialize(deployer);
    // init = await axkToken.initialize(signer)
    //await signer.sendTransaction({ to: tokenAddress, value: ethers.utils.parseEther("5.0") });
    console.log("Trx hash:", initContract.hash);
    
  
  }
  
  initialize()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
    