import { useEffect, useState } from "react";
import { getDateAsHexString, getStateAsHexString } from "../utils/proofs";
import { requestCredentials } from "../utils/secrets";
import MintButton from "./atoms/mint-button";

async function getCredsFromExtension() {
    try {
      // Request credentials. Need to request because extension generates new secret
      const c = await requestCredentials();
      return {
        ...c,
        subdivisionHex: getStateAsHexString(
          c.subdivision,
          c.countryCode
        ),
        completedAtHex: getDateAsHexString(c.completedAt),
        birthdateHex: getDateAsHexString(c.birthdate),
      };
    } catch (e) {
      return "There was a problem in storing your credentials";
    }
  }

const RetryMinting = (props) => {
    const [creds, setCreds] = useState({});
    useEffect(()=>{
        async function f(){
            setCreds(await getCredsFromExtension());
        }
    })
    return creds ? <MintButton creds={creds} successCallback={props.successCallback} /> : null
}

export default RetryMinting;