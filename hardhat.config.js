require("@nomiclabs/hardhat-waffle");
require("./tasks/startVoting.js");
require("./tasks/vote.js");
require("./tasks/finishVoting.js");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
      accounts: []
    }
  },
  plugins: ["solidity-coverage"]
};
