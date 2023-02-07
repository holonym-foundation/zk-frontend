/**
 * Users can be directed to this page from an external site when the owner
 * of the external site wants the user to mint a certain type of credential
 * and generate a certain proof.
 * 
 * This component displays a loading screen while it parses the URL and
 * then redirects the user to the appropriate page (e.g., mint government ID).
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import RoundedWindow from "./RoundedWindow";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../context/HoloKeyGenSig";
import { getCredentials, getProofMetadata } from "../utils/secrets";
import { serverAddress } from '../constants';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();
  const { holoAuthSigDigest } = useHoloAuthSig();

  // URL should include:
  // 1. credential type (e.g., "idgov")
  // 2. proof type (e.g., "uniqueness")
  // 3. callback URL, must be base64 encoded (e.g., btoa("https://holonym.com"))
  useEffect(() => {
    (async () => {
      const credentialType = searchParams.get("credentialType");
      const proofType = searchParams.get("proofType");
      const callback = searchParams.get("callback");

      console.log('credentialType', credentialType);
      console.log('proofType', proofType);
      console.log('callback', callback);
      if (!credentialType) {
        setError("Invalid URL. Missing credential type.");
        return;
      }
      if (!proofType) {
        setError("Invalid URL. Missing proof type.");
        return;
      }
      if (!callback) {
        setError("Invalid URL. Missing callback URL.");
        return;
      }
      // Note the magic strings used here. This needs to be updated if we add cred types
      if (!['idgov', 'phone'].includes(credentialType)) {
        setError("Invalid credential type. Credential type must be 'idgov' or 'phone'.");
        return;
      }
      // Note the magic strings used here. This needs to be updated if we add cred types
      if (!['uniqueness', 'us-residency'].includes(proofType)) {
        setError("Invalid proof type. Proof type must be 'uniqueness' or 'us-residency'.");
        return;
      }
      try {
        new URL(window.atob(callback));
      } catch (err) {
        setError("Invalid callback URL. Callback is invalid.");
        return;
      }

      // Check whether the user has creds of credentialType and whether they have a proof of proofType
      const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest);
      const userHasCreds = sortedCreds?.[serverAddress[`${credentialType}-v2`]];
      const proofMetadata = await getProofMetadata(holoKeyGenSigDigest, holoAuthSigDigest);
      const proofMetadataForSBT = proofMetadata?.filter(metadata => metadata.proofType === proofType);
      if (proofMetadataForSBT?.length > 0) {
        // Clear relevant localStorage items.
        window.localStorage.removeItem('register-credentialType');
        window.localStorage.removeItem('register-proofType');
        window.localStorage.removeItem('register-callback');
        // Send user to the callback URL. Include address that owns the proof SBT
        window.location.href = `${window.atob(callback)}?address=${proofMetadataForSBT[0].address}`;
      }
      else if (userHasCreds) {
        // TODO: Add support for off-chain proofs (see off-chain-proofs component.)
        // Send user to proof generation page. User gets redirected back here after submitting their proof
        navigate(`/prove/${proofType}`)
      }
      else {
        // Send user to minting page for credentialType
        navigate(`/mint/${credentialType}`)
      }

      window.localStorage.setItem('register-credentialType', credentialType);
      window.localStorage.setItem('register-proofType', proofType);
      window.localStorage.setItem('register-callback', callback);
    })();
  }, [])

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

  // TODO: Maybe display a message telling the user what they are going to do?
  // E.g., "A proof of uniqueness has been requested by ${callback.origin}. 
  // To fulfill this request, you need to verify your government ID and generate a 
  // proof of uniqueness. Click OK to continue."

  return (
    <>
      <RoundedWindow>
        <div style={mainDivStyles}>
          {error ? (
            <>
              <p style={{ color: 'red', fontSize: '1rem' }}>{error}</p>
            </>
          ) : (
            <Oval
              height={100}
              width={100}
              color="white"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
              ariaLabel="oval-loading"
              secondaryColor="black"
              strokeWidth={2}
              strokeWidthSecondary={2}
            />
          )}
        </div>
      </RoundedWindow>
    </>
  );
};

export default Register;
