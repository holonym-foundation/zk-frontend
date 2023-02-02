import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ThreeDots } from "react-loader-spinner";
import RoundedWindow from "./RoundedWindow";
import { useLitAuthSig } from '../context/LitAuthSig';
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../context/HoloKeyGenSig";
import { getCredentials, storeCredentials } from "../utils/secrets";
import { createLeaf, getDateAsInt } from "../utils/proofs";
import { serverAddress } from "../constants/misc";

const ConvertCredentials = () => {
  const { litAuthSig } = useLitAuthSig();
  const { holoAuthSigDigest } = useHoloAuthSig();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();
  const [error, setError] = useState();
  const [converting, setConverting] = useState();
  const [success, setSuccess] = useState();
  
  async function handleClick() {
    setConverting(true);
    const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig);
    if (!sortedCreds) {
      setError("Could not retrieve credentials.");
      return;
    }
    console.log('sortedCreds before', Object.assign({}, sortedCreds))
    const govIdCreds = sortedCreds[serverAddress['idgov']];
    if (govIdCreds && (!govIdCreds.creds || !govIdCreds.leaf || !govIdCreds.pubkey || !govIdCreds.signature)) {
      const reformattedGovIdCreds = {
        creds: {
          customFields: [
            ethers.BigNumber.from(govIdCreds.rawCreds.countryCode).toHexString(),
            ethers.BigNumber.from(
              govIdCreds.derivedCreds.nameDobCitySubdivisionZipStreetExpireHash.value
            ).toHexString(),
          ],
          iat: getDateAsInt(govIdCreds.rawCreds.completedAt),
          issuerAddress: govIdCreds.issuer,
          scope: ethers.BigNumber.from(govIdCreds.scope).toHexString(),
          secret: govIdCreds.secret,
          newSecret: govIdCreds.newSecret,
          serializedAsPreimage: govIdCreds.serializedCreds.map((c) =>
            ethers.BigNumber.from(c).toHexString()
          ),
          serializedAsNewPreimage: [
            ethers.BigNumber.from(govIdCreds.serializedCreds[0]).toHexString(),
            ethers.BigNumber.from(govIdCreds.newSecret).toHexString(),
            ethers.BigNumber.from(govIdCreds.serializedCreds[2]).toHexString(),
            ethers.BigNumber.from(govIdCreds.serializedCreds[3]).toHexString(),
            ethers.BigNumber.from(govIdCreds.serializedCreds[4]).toHexString(),
            ethers.BigNumber.from(govIdCreds.serializedCreds[5]).toHexString(),
          ],
        },
        leaf: ethers.BigNumber.from(
          await createLeaf(govIdCreds.serializedCreds.map((c) => ethers.BigNumber.from(c).toString()))
        ).toHexString(),
        newLeaf: ethers.BigNumber.from(
          await createLeaf([
            ethers.BigNumber.from(govIdCreds.serializedCreds[0]).toString(),
            ethers.BigNumber.from(govIdCreds.newSecret).toString(),
            ethers.BigNumber.from(govIdCreds.serializedCreds[2]).toString(),
            ethers.BigNumber.from(govIdCreds.serializedCreds[3]).toString(),
            ethers.BigNumber.from(govIdCreds.serializedCreds[4]).toString(),
            ethers.BigNumber.from(govIdCreds.serializedCreds[5]).toString(),
          ])
        ).toString(),
        metadata: {
          derivedCreds: govIdCreds.derivedCreds,
          fieldsInLeaf: govIdCreds.fieldsInLeaf,
          rawCreds: govIdCreds.rawCreds,
        },
        pubkey: {
          x: "n/a",
          y: "n/a",
        },
        signature: {
          R8: {
            x: "n/a",
            y: "n/a",
          },
          S: "n/a",
        },
      };
      sortedCreds[serverAddress['idgov-v2']] = reformattedGovIdCreds;
    }
    // Handle phone number creds
    const phoneNumberCreds = sortedCreds[serverAddress['phone']];
    if (phoneNumberCreds && (!phoneNumberCreds?.creds || !phoneNumberCreds?.leaf || !phoneNumberCreds?.pubkey || !phoneNumberCreds?.signature)) {
      const reformattedPhoneCreds = {
        creds: {
          customFields: [
            ethers.BigNumber.from(phoneNumberCreds.phoneNumber).toHexString(),
            ethers.BigNumber.from(0).toHexString(),
          ],
          iat: getDateAsInt(phoneNumberCreds.completedAt),
          issuerAddress: phoneNumberCreds.issuer,
          scope: ethers.BigNumber.from(0).toHexString(),
          secret: phoneNumberCreds.secret,
          newSecret: phoneNumberCreds.newSecret,
          serializedAsPreimage: phoneNumberCreds.serializedCreds.map((c) =>
            ethers.BigNumber.from(c).toHexString()
          ),
          serializedAsNewPreimage: [
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[0]).toHexString(),
            ethers.BigNumber.from(phoneNumberCreds.newSecret).toHexString(),
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[2]).toHexString(),
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[3]).toHexString(),
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[4]).toHexString(),
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[5]).toHexString(),
          ],
        },
        leaf: ethers.BigNumber.from(
          await createLeaf(phoneNumberCreds.serializedCreds.map((c) => ethers.BigNumber.from(c).toString()))
        ).toHexString(),
        newLeaf: ethers.BigNumber.from(
          await createLeaf([
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[0]).toString(),
            ethers.BigNumber.from(phoneNumberCreds.newSecret).toString(),
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[2]).toString(),
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[3]).toString(),
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[4]).toString(),
            ethers.BigNumber.from(phoneNumberCreds.serializedCreds[5]).toString(),
          ])
        ).toString(),
        metadata: {
          phoneNumber: phoneNumberCreds.phoneNumber,
        },
        pubkey: {
          x: "n/a",
          y: "n/a",
        },
        signature: {
          R8: {
            x: "n/a",
            y: "n/a",
          },
          S: "n/a",
        },
      };
      // TODO: this to serverAddress['phone-v2']
      sortedCreds[serverAddress['phone']] = reformattedPhoneCreds;
    }
    console.log('sortedCreds after', sortedCreds);
    try {
      await storeCredentials(sortedCreds, holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig);
    } catch (err) {
      console.error(err);
      setError(err);
      return;
    }
    setConverting(false);
    setSuccess(true);
  }

  const mainDivStyles = {
    position: "relative",
    paddingTop: "100px",
    width: "100%",
    height: "90%",
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    flexDirection: "column",
  }

  return (
    <RoundedWindow>
      <div style={mainDivStyles}>
        <h2>Convert old credentials to new credentials</h2>
        {success ? (
          <div>
            <p style={{ maxWidth: "700px" }}>
              Your old credentials have been converted to new credentials.
            </p>
            <p style={{ maxWidth: "700px" }}>
              You can now leave this page.
            </p>
          </div>
        ) : (
          <>
            <div style={{ maxWidth: "700px" }}>
              <p>
                In Febuary 5, 2023, we changed our architecture to use a new credential format. 
                Beta users who minted holos before Febuary 5, 2023 need to convert their old credentials to new credentials.
              </p>
            </div>
            {error ? (
              <div style={{ maxWidth: "700px", marginTop: "10px" }}>
                <p style={{ color: "red", fontSize: "1rem" }}>{error}</p>
              </div>
            ) : null}
            <button 
              style={{ 
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "20px"
              }} 
              className="mint-button"
              type="button"
              onClick={handleClick}
            >
              {converting ? "Converting" : "Convert credentials"}
              {converting && (
                <ThreeDots 
                  height="20" 
                  width="20" 
                  radius="2"
                  color="#0F0F0F" 
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{marginLeft:"20px"}}
                  wrapperClassName=""
                  visible={true}
                />
              )}
            </button>
            <div style={{ maxWidth: "700px", marginTop: "10px" }}>
              <ul style={{ lineHeight: "1.5", fontFamily: "Montserrat", fontSize: "14px" }}>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Why do I need to convert my credentials?</span>
                  {" "}Converting old credentials to new credentials will allow you to generate more proofs using your holo.
                </li>
                <li>
                  <span style={{ fontWeight: 'bold' }}>What happens if I do not convert my credentials?</span>
                  {" "}Credentials issued before Febuary 5, 2023 that have not been converted to the new format cannot be used to generate new proofs.
                </li>
                <li>
                  <span style={{ fontWeight: 'bold' }}>Will my info remain private? What happens during the conversion?</span> 
                  {" "}Your info will remain private during the whole process. The conversion process happens entirely in your browser after you click the button.
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </RoundedWindow>
  );
};

export default ConvertCredentials;
