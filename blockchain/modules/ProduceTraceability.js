const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ProduceTraceabilityModule = buildModule("ProduceTraceabilityModule", (m) => {
  const ProduceTraceability = m.contract("ProduceTraceability");

  return { ProduceTraceability };
});

module.exports = ProduceTraceabilityModule;
