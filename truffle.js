var HDWalletProvider = require("truffle-hdwallet-provider");
// var mnemonic = "glance fun glide upset burger muffin armed earth salmon hover once exchange";

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    // development: {
    //   provider: function() {
    //     return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/", 0, 50);
    //   },
    //   network_id: '*',
    //   gas: 9999999
    // }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};