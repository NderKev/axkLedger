const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const axkTokenModule = buildModule("axkTokenModule", (m) => {
  const axkToken = m.contract("axkToken");

  return { axkToken };
});

module.exports = axkTokenModule;