import { useEffect, useState } from "react";
import { getDateAsHexString, getStateAsHexString } from "../utils/proofs";
import { getLocalEncryptedUserCredentials, decryptUserCredentials } from "../utils/secrets";
import { serverAddress } from "../constants/misc";
import MintButton from "./atoms/mint-button";

// TODO: Delete this file?

async function getCredsFromExtension() {
    try {
      // Request credentials. Need to request because extension generates new secret
      const { sigDigest, encryptedCredentials, encryptedSymmetricKey } = await getLocalEncryptedUserCredentials()
      const sortedCreds = await decryptUserCredentials(encryptedCredentials, encryptedSymmetricKey)
      const c = sortedCreds[serverAddress];
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
    const [creds, setCreds] = useState();
    useEffect(()=>{
        async function f(){
            setCreds(await getCredsFromExtension());
        }
    })
    return creds ? <MintButton creds={creds} successCallback={props.successCallback} /> : null
}

export default RetryMinting;