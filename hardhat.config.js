require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-ignition");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();


const { PRIVATE_KEY, INFURA_PROJECT_ID, POLYGON_API_KEY, OKLINK_AMOY_API} = process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    polygonAmoy: {
      url: `https://polygon-amoy.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${PRIVATE_KEY}`],
      gasPrice: "auto",
    }
  },
  sourcify : {
    enabled: false
  },
  etherscan: {
    apiKey: {
    polygonAmoy: OKLINK_AMOY_API // Optional: Add if you want to verify contracts on PolygonScan
  },
   customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL:
            "https://www.oklink.com/api/explorer/v1/contract/verify/async/api/polygonAmoy",
          browserURL: "https://www.oklink.com/polygonAmoy",
        },
      },
    ],
}
};


