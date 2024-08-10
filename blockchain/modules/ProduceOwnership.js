const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ProduceOwnershipModule", (m) => {
  // Define initial parameters
  const produceManagement = "0x3f8FB454c86f89C43F8581a5830594452a5684fa";

  const ProduceOwnership = m.contract("ProduceOwnership", [produceManagement]);

  // Return the deployed contract instances
  return { ProduceOwnership };
});
