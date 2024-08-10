async function balance() {
  // Get the contract to deploy
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", balance.toString());

  //const ProduceTraceability = await ethers.getContractFactory("ProduceTraceability");
 // const produceTraceability = await ProduceTraceability.deploy();

  //console.log("Contract deployed to address:", produceTraceability.address);
}

balance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
