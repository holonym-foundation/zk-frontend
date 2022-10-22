import React from "react";
import Github from "../../img/Github.svg";
import Google from "../../img/Google.svg";
import CircleWavy from "../../img/CircleWavy.svg";
import CircleWavyCheck from "../../img/CircleWavyCheck.svg";
import Orcid from "../../img/Orcid.svg";
import TwitterLogo from "../../img/TwitterLogo.svg";
import profile from "../../img/profile.svg";
const icons = {
  google: Google,
  github: Github,
  orcid: Orcid,
  twitter: TwitterLogo,
};

export default function BigCard(props) {
  return (
    <div className="x-card">
      <div className="id-card profile">
        <div className="id-card-1">
          <img src={profile} loading="lazy" alt="" className="id-img" />
        </div>
        <div className="id-card-2">
          <div className="id-profile-name-div">
            <h3 id="w-node-_0efb49bf-473f-0fcd-ca4f-da5c9faeac9a-4077819e" className="h3 no-margin">
              {props.holo.name}
            </h3>
          </div>
          <div className="spacer-xx-small"></div>
          <p className="id-designation">{props.holo.bio}</p>
        </div>
      </div>
      <div className="spacer-small"></div>
      <div className="spacer-small"></div>
      {Object.keys(props.holo)
        .filter((k) => !["name", "bio"].includes(k))
        .map((k, index) => (
          <div key={index}>
            <div className="card-text-div">
              <img src={icons[k]} loading="lazy" alt="" className="card-logo" />
              <div className="card-text">{props.holo[k] || "Not listed"}</div>
              <img src={props.holo[k] ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="id-verification-icon" />
            </div>
            <div className="spacer-x-small"></div>
          </div>
        ))}
    </div>
  );
}
