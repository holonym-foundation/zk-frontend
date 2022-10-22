import React, { useEffect, useState } from "react";
import { useNetwork, useAccount } from "wagmi";
import QRCode from "react-qr-code";
import ReturnButton from "./atoms/ReturnButton";
import { Modal } from "./atoms/Modal.js";
import { EditProfileButton } from "./edit-profile.js"
import { InfoButton } from "./info-button.js"
import Orcid from "../img/Orcid.svg";
import TwitterLogo from "../img/TwitterLogo.svg";
// import GoogleLogo from "../img/Google.svg";
import DiscordLogo from "../img/icons8-discord.svg";
import Share from "../img/Share.svg";import { DiscordLoginButton, ORCIDLoginButton, TwitterLoginButton, GitHubLoginButton } from "./atoms/LoginButtons.js";
import GithubLogo from "../img/Github.svg";
import EthereumLogo from '../img/Ethereum.png';
import GnosisLogo from '../img/Gnosis.png';
import PolygonLogo from '../img/Polygon.png';
import CircleWavy from "../img/CircleWavy.svg";
import CircleWavyCheck from "../img/CircleWavyCheck.svg";
import { desiredChain, ChainSwitcher } from "../constants/desiredChain";

const chainIconClasses = "id-verification-icon id-verification-chain-icon"
const chainIconClassesGray = chainIconClasses + " grayscale"

const GnosisIcon = () => <img src={GnosisLogo} loading="lazy" alt="" className={chainIconClasses} style={{marginLeft:"10px"}} />
const PolygonIcon = () => <img src={PolygonLogo} loading="lazy" alt="" className={chainIconClasses} style={{marginLeft:"10px"}} />

const Icons = (props) => {
  return <>
    <div>
    
      {props.holo?.['mumbai']?.[props.web2service] && <PolygonIcon />}
      {props.holo?.['gnosis']?.[props.web2service] && <GnosisIcon />}

      <img src={props.holo?.["gnosis"]?.[props.web2service] || props.holo?.["mumbai"]?.[props.web2service] ? CircleWavyCheck : CircleWavy} 
        className="card-status"
        loading="lazy"
        style={{marginLeft:"10px"}}
         />
    </div>
  </>
}
const MyHolo = (props) => {
  const [shareModal, setShareModal] = useState(false);
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const myUrl = `https://app.holonym.id/lookup/address/${account?.address}`;
  
  const defaultHolo = { 
    gnosis: {
      google: null,
      orcid: null,
      github: null,
      twitter: null,
    },
    mumbai: {}
  };
  const [holo, setHolo] = useState(defaultHolo);
   // Load the user's Holo when account or chain changes
  useEffect(() => {
    async function getAndSetHolo() {
      try {
        const gnosisHoloIsEmpty = Object.values(holo['gnosis']).every((x) => !x);
        const mumbaiHoloIsEmpty = Object.values(holo['mumbai']).every((x) => !x);
        const holoIsEmpty = gnosisHoloIsEmpty && mumbaiHoloIsEmpty
        if (!holoIsEmpty || !account?.address) {
          return;
        } //only update holo if it 1. hasn't already been updated, & 2. there is an actual address provided. otherwise, it will waste a lot of RPC calls
        console.log('fetching holo')
        const response = await fetch(`https://sciverse.id/api/getHolo?address=${account?.address}`);
        let holo_ = await response.json();
        setHolo(holo_)
        // setHolo({
        //   ...defaultHolo,
        //   google: holo_.google,
        //   orcid: holo_.orcid,
        //   github: holo_.github,
        //   twitter: holo_.twitter,
        //   discord: holo_.discord,
        //   name: holo_.name,
        //   bio: holo_.bio,
        // });
      } catch (err) {
        console.error("Error:", err);
      }
    }
    getAndSetHolo();
  }, [activeChain, account]);
  console.log(holo)
  return (<div className="bg-img x-section wf-section" style={{ width: "100vw" }}>
            <div className="x-container w-container">
              <div className="x-wrapper small-center">
                <div className="spacer-small"></div>
                <h1 className="h1">Your Public Holo</h1>
                <h2 className="p-1 white big">Link your Web2 credentials</h2>
                <div className="spacer-medium"></div>
                <div className="x-card small">
                  <div className="card-heading">
                    <h3 className="h3 no-margin">
                      {holo['gnosis']?.name || holo['mumbai']?.name || "Your Name"}
                      <p className="no-margin">{holo['gnosis']?.bio || holo['mumbai']?.bio || "Your bio"}</p>
                    </h3>
                    <EditProfileButton {...props} holo={holo} />
                  </div>
                  {/* <img src={profile} loading="lazy" alt="" style={{textAlign: "left"}} /> */}

                  <div className="spacer-small"></div>

                  <div className="card-heading">
                    <h3 id="w-node-_7e19a9c8-ff94-4387-04bd-6aaf6d53a8ea-b12b29e5" className="h3 no-margin">
                      Link your profiles
                    </h3>
                    <InfoButton
                      text={`This will link your blockchain address, ${props.account}, to your Web2 accounts! Please be careful and only submit credentials you want visible in the "blockchain yellowpages." You will be guided through a process to link the credentials on-chain 💥 🌈 🤩 `}
                    />
                  </div>

                  <div className="spacer-x-small"></div>
                  <div className="card-text-wrapper">
                    <div className="card-text-div">
                      <img src={DiscordLogo} loading="lazy" alt="" className="card-logo" />
                      <div className="card-text">{`@${holo['gnosis']?.discord || holo['mumbai']?.discord || "username"}`}</div>
                      <DiscordLoginButton creds={holo['gnosis']?.discord || holo['mumbai']?.discord} desiredChain={desiredChain} />
                    </div>
                    <Icons web2service="discord" holo={holo} />
                  </div>
                  {/* commenting out gmail -- we don't want people to be able to build a spamming list, and emails are PII. There's ambiguous regulations for blockchain PII
                  <div className="spacer-small"></div>
                  <div className="card-text-wrapper">
                    <div className="card-text-div">
                      <img src={GoogleLogo} loading="lazy" alt="" className="card-logo" />
                      <div className="card-text">{holo.google || "youremail@gmail.com"}</div>
                      <GoogleLoginButton creds={holo.google} />
                    </div>
                    <img src={holo.google ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
                  </div> */}
                  <div className="spacer-x-small"></div>
                  <div className="card-text-wrapper">
                    <div className="card-text-div">
                      <img src={Orcid} loading="lazy" alt="" className="card-logo" />
                      <div className="card-text">{holo['gnosis']?.orcid || holo['mumbai']?.orcid || "xxxx-xxxx-xxxx-xxxx"}</div>
                      <ORCIDLoginButton creds={holo['gnosis']?.orcid || holo['mumbai']?.orcid} desiredChain={desiredChain} />
                    </div>
                    <Icons web2service="orcid" holo={holo} />
                  </div>
                  <div className="spacer-x-small"></div>
                  <div className="card-text-wrapper">
                    <div className="card-text-div">
                      <img src={TwitterLogo} loading="lazy" alt="" className="card-logo" />
                      <div className="card-text">{`@${holo['gnosis']?.twitter || holo['mumbai']?.twitter || "TwitterHandle"}`}</div>
                      <TwitterLoginButton creds={holo['gnosis']?.twitter || holo['mumbai']?.twitter} desiredChain={desiredChain} />
                    </div>
                    <Icons web2service="twitter" holo={holo} />
                  </div>
                  <div className="spacer-x-small"></div>
                  <div className="card-text-wrapper">
                    <div className="card-text-div">
                      <img src={GithubLogo} loading="lazy" alt="" className="card-logo" />
                      <div className="card-text">{`@${holo['gnosis']?.github || holo['mumbai']?.github || "githubusername"}`}</div>
                      <GitHubLoginButton creds={holo['gnosis']?.github || holo['mumbai']?.github} desiredChain={desiredChain} />
                    </div>
                    <Icons web2service="github" holo={holo} />
                  </div>
                </div>
                <div className="spacer-large"></div>
                <ReturnButton />
                <div className="spacer-medium"></div>
                {/* Share button: copies link and makes QR for it */}
                <div
                  id="share-button"
                  className="x-wrapper small-center animation0"
                  onClick={() => {
                    navigator.clipboard.writeText(myUrl);
                    setShareModal(true);
                  }}
                >
                  <h3>Share</h3>
                  <img src={Share} loading="lazy" alt="" className="card-logo" />
                </div>
                {/* <a onClick className="x-button secondary"><img src={QR} /></a> */}
                {/* <a href="#" className="x-button secondary w-button">continue</a>
          <a href="#" className="x-button secondary no-outline w-button">Learn more</a> */}
              </div>
            </div>
            <Modal visible={shareModal} setVisible={setShareModal} blur={true}>
              <div className="x-wrapper small-center" style={{ padding: "0px", minWidth: "285px" }}>
                <h5>Your public profile is: </h5>
                <textarea style={{ width: "100%", height: "150px" }} type="email" className="text-field w-input" value={myUrl} />
                <p className="success">✓ Copied to clipboard</p>
                <h5>Your QR</h5>
                <QRCode value={myUrl} />
              </div>
            </Modal>
          </div>
  )
};
export default MyHolo;