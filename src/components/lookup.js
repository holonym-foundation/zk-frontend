import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { desiredChainId, desiredChainCurrency } from "../constants/desiredChain";
import { SearchBar } from "./search-bar";
// import { DisplayPOAPs } from "./poaps";
import { Modal } from "./atoms/Modal.js";
import Holo from "./atoms/Holo";
import { getHoloFromAddress, getHoloFromCredentials, searchHolos, holoIsEmpty } from "../utils/holoSearch";
import { useSigner, useAccount } from "wagmi";

// import ToggleButton from 'react-bootstrap/ToggleButton'
// import ButtonGroup from 'react-bootstrap/ButtonGroup'
// import 'bootstrap/dist/css/bootstrap.css';

const { ethers } = require("ethers");

// Wraps everything on the lookup screen with style
const Wrapper = (props) => {
  // return <div className="x-section bg-img wf-section" style={{width:'100vw', height:'100vh'}}>
  return (
    <div className="x-section bg-img wf-section">
      <div className="x-container w-container">
        <div className="x-wrapper small-center" style={{width:"100vw"}}>{props.children}</div>
      </div>
    </div>
  );
};

//   MAKE SURE NETWORK IS SET TO THE RIGHT ONE (AVALANCHE C TESTNET)
export const Lookup = (props) => {
  const [holos, setHolos] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  let params = useParams();
  const { data: signer } = useSigner();
  const { data: account } = useAccount();

  const sendCrypto = async (amount, to) => {
    console.log("sending", amount);
    let tx = {
      to: holos[0].address,
      from: account.address,
      nonce: await signer.getTransactionCount(),
      gasLimit: 200000,
      // value: ethers.utils.parseEther(".1"),
      value: ethers.utils.parseEther(amount),
      chainId: desiredChainId,
    };
    console.log(tx, 'tx')
    await signer.sendTransaction(tx);
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendCrypto(event.target.amount.value).then((result) => setModalVisible(false));
  };

  useEffect(() => {
    if (!params.web2service || !params.credentials) {
      return;
    }
    switch (params.web2service) {
      case "holosearch":
        searchHolos(params.credentials).then((holosTemp) => setHolos(holosTemp));
        break;
      case "address":
        getHoloFromAddress(params.credentials).then((holo) => setHolos([holo]));
        break;
      default:
        console.log('getting holo from cred')
        getHoloFromCredentials(params.credentials, params.web2service).then((holo) => setHolos([holo]));
    }
  }, [params.credentials, params.web2service]);

  // if the URL is just /lookup or something malformed, just return the search bar
  if (!params.web2service || !params.credentials) {
    return (
      <Wrapper>
        <SearchBar />
      </Wrapper>
    );
  }
  if(!holos || ( (holos.length === 1) && holoIsEmpty(holos[0]) ) ){
    return <Wrapper>
    <SearchBar />
    <p>No users found</p>
    </Wrapper>
  }
  return (
    <Wrapper>
      <SearchBar />
      <div className="spacer-large"></div>
      {holos.length === 1 ? ( // Display one Holo, with payment button and POAPs
        <>
          <Holo holo={holos[0]} />
          <div className="spacer-medium"></div>
          <div className="btn-wrapper">
            <button onClick={() => setModalVisible(true)} className="x-button primary">
              Pay {holos[0].name || holos[0].google || holos[0].orcid || holos[0].twitter || holos[0].github}
            </button>

            <Modal visible={modalVisible} setVisible={() => {}} blur={true}>
              <h3 className="h3 white">
                How much {desiredChainCurrency} would you like to send{" "}
                {holos[0].name || holos[0].google || holos[0].orcid || holos[0].twitter || holos[0].github}?
              </h3>
              <div className="x-container w-container" style={{ justifyContent: "space-between", color: "black" }}>
                <form onSubmit={handleSubmit}>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    className="text-field w-input"
                    style={{ height: "10px", width: "100%" }}
                    placeholder="0.1"
                    min="0"
                  />
                  <div className="spacer-small"></div>
                  <button
                    onClick={() => setModalVisible(false)}
                    type="button"
                    className="x-button secondary"
                    style={{ width: "45%", marginRight: "10px" }}
                  >
                    Close
                  </button>
                  <button type="submit" className="x-button" style={{ width: "45%", marginLeft: "10px" }}>
                    Submit
                  </button>
                </form>
              </div>
            </Modal>
          </div>
          <div>{/* <DisplayPOAPs address={holos[0].address} /> */}</div>
        </>
      ) : (
        // Display multiple holos, i.e., the result of an ambiguous search
        holos.map((userHolo) => (
          <div key={parseInt(userHolo.address, 16)}>
            <div className="spacer-small"></div>
            <Holo holo={userHolo} />
          </div>
        ))
      )}
    </Wrapper>
  );
};
