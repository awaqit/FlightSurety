import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import "babel-polyfill";

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

let oracles = [];

// register oracles
(async () => {
  try {
    oracles = (await web3.eth.getAccounts()).slice(19); // 80 oracles 

    for (let i = 0; i < oracles.length; i++) {
      await flightSuretyApp.methods.registerOracle().send({
        from: oracles[i],
        value: web3.utils.toWei('1', 'ether')
      });
    }
  } catch (e) {
    console.error(e);
  }
})();


flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error);
}).on('data', async event => {
  let args = event.returnValues;
  console.log(`Index: ${args.index}, Airline: ${args.airline}, Flight: ${args.flight}, Timestamp: ${args.timestamp}`);

  for (let i = 0; i < oracles.length; i++) {
    try {
      await flightSuretyApp.methods.submitOracleResponse(args.index, args.airline, args.flight, args.timestamp, getRandomStatusCode()).send({
        from: oracles[i]
      });
    } catch (err) {
      console.log(err);
    }
  }
});

//TODO: rename
const getRandomStatusCode = () => {
  let status = [10, 20, 30, 40, 50];
  return status[Math.floor(Math.random() * status.length)];
}

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


