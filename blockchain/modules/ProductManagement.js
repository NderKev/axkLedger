const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ProduceManagementModule = buildModule("ProduceManagementModule", (m) => {
  const ProduceManagement = m.contract("ProduceManagement");

  return { ProduceManagement };
});

module.exports = ProduceManagementModule;
