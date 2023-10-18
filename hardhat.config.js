require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.18",
  networks:{
    hardhat:{
      forking:{
        url: process.env.ALCHEMY_URL,
      }
    }
  }
};
