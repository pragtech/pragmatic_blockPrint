import React, { Component } from "react";
import BlockPrint from "./contracts/BlockPrint.json";
import getWeb3 from "./getWeb3";
/* ES6 */
import * as htmlToImage from "html-to-image";
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from "html-to-image";

import "./App.css";
import "./styles/card.css";
import Card from "./components/card";
// using ipfs-api with infura public network for uploading images to the ipfs
const IPFS = require("ipfs-api");
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    name: "",
    certificate: "Certificate",
    buffer: null,
    certificateID: 0,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BlockPrint.networks[networkId];
      const instance = new web3.eth.Contract(
        BlockPrint.abi,
        deployedNetwork && deployedNetwork.address
        // 0xC9aE4b78f49d3cD00a0CCB0E4c16602d9C31fe41
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  createImageFile = async () => {
    console.log("Creating Certificate Image");
    var node = document.getElementById("card");
    console.log(`node: ${node}`);
    const dataUrl = await htmlToImage.toPng(node);
    var img = new Image();
    img.src = dataUrl;
    document.body.appendChild(img);
    var regex = /^data:.+\/(.+);base64,(.*)$/;
    var matches = dataUrl.match(regex);
    var ext = matches[1];
    var data = matches[2];
    var _buffer = Buffer.from(data, "base64");
    this.setState({ buffer: _buffer });
    console.log(_buffer);
  };

  createCertificate = async (event) => {
    event.preventDefault();
    const _name = event.target.name.value;
    const _certificate = event.target.certificate.value;
    this.setState({ name: _name, certificate: _certificate });
    console.log(`${_name} \n${_certificate}`);
  };

  uploadCertificate = async (event) => {
    event.preventDefault();
    if (this.state.buffer == null) {
      console.log("The buffer is null");
      return;
    }
    ipfs.add(this.state.buffer, async (err, result) => {
      console.log("Uploading file");
      console.log(err, result);
      if (err) {
        console.error(err);
        return;
      }
      this.setState({ imageHash: result[0].hash });
      const { accounts, contract } = this.state;
      var contractResponse = await contract.methods
        .mintCertificate(this.state.imageHash)
        .send({ from: accounts[0] });
      console.log(JSON.stringify(contractResponse));
      var newTokenId =
        contractResponse.events.CertificateCreated.returnValues.tokenID;
      const message = `Your certificate id is: ${newTokenId}`;
      alert(message);
      console.log(newTokenId);
    });
  };

  getCertificate = async (event) => {
    event.preventDefault();
    console.log(event.target.certificateID.value);
    const { accounts, contract } = this.state;
    var _certificateID = await contract.methods
      .fetchCertificate(event.target.certificateID.value)
      .call();
    console.log(_certificateID);
    this.setState({ certificateID: _certificateID });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <form onSubmit={this.createCertificate} className="form">
          <label>Name: </label>
          <input type="text" id="name"></input>
          <br></br>
          <br></br>
          <label>Certificate: </label>

          <textarea id="certificate"></textarea>
          <br></br>
          <br></br>
          <input type="submit"></input>
        </form>
        <br></br>
        <br></br>
        <div id="card" style={{ padding: 12 }}>
          <h4>{this.state.name}</h4>
          <p>{this.state.certificate}</p>
        </div>
        <button onClick={this.createImageFile}>Build Image</button>
        <button onClick={this.uploadCertificate}>Upload Image</button>

        <form onSubmit={this.getCertificate}>
          <h2>Get Certificate</h2>
          <label for="certificateID">Certificate Id: </label>
          <input type="number" id="certificateID" />
          <br />
          <h3>
            Certificate: https://ipfs.infura.io/ipfs/
            {this.state.certificateID}
          </h3>
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default App;
