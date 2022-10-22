import React, { useState, useEffect } from "react";
import SmallCard from "./atoms/SmallCard";
import { SearchBar } from "./search-bar.js";
import { Modal } from "./atoms/Modal.js";
import { useNavigate } from "react-router-dom";
import wtf from "../wtf-configured";
import { getHoloFromAddress } from '../utils/holoSearch'
import { useAccount } from "wagmi";

// Wraps everything on the registry screen with style
const Wrapper = (props) => {
  return (
    <>
      <div className="slider-container" style={{ width: "100vw" }}>
        <div className="slider-wrapper">{props.children}</div>
      </div>
      <div className="spacer-small"></div>
    </>
  );
};

let hasBeenRun = false;

const Registry = (props) => {
  const { data: account } = useAccount();
  const getAllAddresses = async () => {
    const response = await fetch(`https://sciverse.id/api/getAllUserAddresses`);
    let allAddresses = await response.json();
    return allAddresses;
  };

  // fetches holos one-by-one from addresses and appends them to holos live
  const setHolosAsyncFromAddresses = async (addresses) => {
    let tmpHolos = [];
    for (const address of addresses) {
      const holo_ = await getHoloFromAddress(address)
      const gnosisHoloIsEmpty = !holo_?.gnosis || Object.values(holo_.gnosis).every((x) => !x);
      const mumbaiHoloIsEmpty = !holo_?.mumbai || Object.values(holo_.mumbai).every((x) => !x);
      const holoIsEmpty = gnosisHoloIsEmpty && mumbaiHoloIsEmpty
      if (!holoIsEmpty) {
        tmpHolos.push(holo_)
        tmpHolos = [...new Set([...tmpHolos])];
        console.log("NEW SET", tmpHolos);
        setHolos(tmpHolos);
      }
    }
  };

  const init = async () => {
    if (!account || hasBeenRun) {
      return;
    }
    hasBeenRun = true;
    try {
      let addresses = await getAllAddresses();
      // Only show the modal if the user doesn't have a Holo:
      if (addresses.includes(account.address.toLowerCase())) {
        setModalVisible(false);
      }
      await setHolosAsyncFromAddresses(addresses);
      // setHolos(allHolos)
    } catch (err) {
      console.error("ERROR: ", err);
    }
  };
  const [holos, setHolos] = useState([]);
  const [modalVisible, setModalVisible] = useState(true);
  useEffect(() => {
    init();
  }, [account]);

  console.log(holos);

  const navigate = useNavigate();

  return (
    <>
      <div className="x-section bg-img wf-section" style={{ height: "200vw" }}>
        <div className="x-container w-container">
          <div className="x-wrapper fullscreen-center" style={{ marginLeft: "1.5vw" }}>
            <h1>DeSci Community</h1>
            <div className="x-wrapper small-center">
              <SearchBar />
              <div className="spacer-large"></div>
            </div>
            <Wrapper>{holos.length ? holos.map((x) => <SmallCard holo={x} href={`/lookup/address/${x.address}`} />) : null}</Wrapper>
            <Modal visible={modalVisible} setVisible={() => {}} blur={true}>
              <h3 className="h3 white">Create your own identity to join the community</h3>
              <div className="x-container w-container" style={{ justifyContent: "space-between" }}>
                <a onClick={() => navigate("/myholo")} className="x-button" style={{ width: "45%" }}>
                  Create My ID
                </a>
                <a href="https://holonym.id" className="x-button secondary" style={{ width: "45%" }}>
                  Learn More
                </a>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};
export default Registry;
