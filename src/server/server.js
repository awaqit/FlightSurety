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
web3.eth.getAccounts(async (e, accounts) => {
  for (let i = 25; i < 50; i++) {
    await flightSuretyApp.methods.registerOracle().send({
      from: accounts[i],
      value: web3.utils.toWei('1', 'ether'),
      gas: 6721975
    });
  

    let result = await flightSuretyApp.methods.getMyIndexes().call({ from: accounts[i] });
    oracles.push(
      {
        address: accounts[i],
        indexs: result
      }
    );
}
});



flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error);
}).on('data', async event => {

  let args = event.returnValues;
  let statusCode = getRandomStatusCode();
  console.log(`Index: ${args.index}, Airline: ${args.airline}, Flight: ${args.flight}, Timestamp: ${args.timestamp}`);

  for (let i = 0; i < oracles.length; i++) {
    try {

      if (!oracles[i].indexs.includes(args.index)) {
        console.log(idx, `(Oracle does not match indices)`);
        return;
      }

      await flightSuretyApp.methods.submitOracleResponse(args.index, args.airline, args.flight, args.timestamp, statusCode).send({
        from: oracles[i].address,
        gas: 200000
      });

      console.log(idx, "Oracle Response " + JSON.stringify(oracles[i]) + " Status Code: " + statusCode);

    } catch (err) {
      console.log(err);
    }
  }
});

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


