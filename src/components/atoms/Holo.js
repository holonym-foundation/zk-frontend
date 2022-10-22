import React from "react";
import CircleWavy from "../../img/CircleWavy.svg";
import CircleWavyCheck from "../../img/CircleWavyCheck.svg";
import GithubLogo from "../../img/Github.svg";
import GoogleLogo from "../../img/Google.svg";
import OrcidLogo from "../../img/Orcid.svg";
import DiscordLogo from "../../img/icons8-discord.svg";
import EthereumLogo from '../../img/Ethereum.png';
import GnosisLogo from '../../img/Gnosis.png';
import PolygonLogo from '../../img/Polygon.png';

import TwitterLogo from "../../img/TwitterLogo.svg";
import profile from "../../img/profile.svg";
import { linkFor } from "../../utils/link-for.js";
import { useNavigate } from "react-router-dom";

const icons = {
  google: GoogleLogo,
  github: GithubLogo,
  orcid: OrcidLogo,
  twitter: TwitterLogo,
  discord: DiscordLogo
};
// const defaultHolo = {
//   address: "",
//   name: "Anonymous",
//   bio: "No information provided",
//   twitter: "",
//   google: "",
//   github: "",
//   orcid: "",
// };

const Holo = (props) => {
  const navigate = useNavigate();

  const name = props.holo?.['gnosis']?.name || props.holo?.['mumbai']?.name
  const bio = props.holo?.['gnosis']?.bio || props.holo?.['mumbai']?.bio
  const defaultChain = props.holo?.['gnosis'] ? 'gnosis' : 'mumbai'

  return (
      <div className="x-card" onClick={()=>navigate('/lookup/address/' + props.holo.address)}>
        <div className="id-card profile">
          <div className="id-card-1">
            <img src={profile} loading="lazy" alt="" className="id-img" />
          </div>
          <div className="id-card-2">
            <div className="id-profile-name-div">
              <h3 id="w-node-_0efb49bf-473f-0fcd-ca4f-da5c9faeac9a-4077819e" className="h3 no-margin">
                {name}
              </h3>
            </div>
            <div className="spacer-xx-small"></div>
            <p className="id-designation">{bio}</p>
          </div>
        </div>
        <div className="spacer-small"></div>
        {/* <div className="card-heading">
        <h3 className="h3 no-margin">Profile Strength</h3>
        <div className="v-spacer-small"></div>
        <h3 className="h3 no-margin active">Pro</h3>
        <InfoButton text='Profile Strength is stronger the more accounts you have, the more recently you link the accounts, and greater your social activity metrics (e.g., number of friends, followers, repositories, etc.)' />
      </div> */}
        <div className="spacer-small"></div>
        {Object.keys(props.holo?.[defaultChain])
          .filter((k) => !["name", "bio", "address", "google"].includes(k))
          .map((k, index) => {
            const creds = props.holo?.gnosis?.[k] || props.holo?.mumbai?.[k]
            const chainIconClasses = "id-verification-icon id-verification-chain-icon"
            return (
              <div key={index}>
                <a style={{ textDecoration: "none" }} href={linkFor(k, props.holo?.['gnosis']?.[k])}>
                  <div className="card-text-div">
                    <img src={icons[k]} loading="lazy" alt="" className="card-logo" />
                    <div className="card-text">{creds || "Not listed"}</div>
                    <img style={{marginRight:"4px"}} src={creds ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="id-verification-icon" />
                    {props.holo?.['mumbai']?.[k] && <img src={PolygonLogo} loading="lazy" title="Verified on Mumbai" className={chainIconClasses} />}
                    {props.holo?.['gnosis']?.[k] && <img src={GnosisLogo} loading="lazy" title="Verified on Gnosis" className={chainIconClasses} />}
                  </div>
                </a>
                <div className="spacer-x-small"></div>
              </div>
            )}
          )}
      </div>
  );
};

export default Holo;
