import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MintButton from "./mint-button";
import StoreCredentials from "./store-credentials";
import StepSuccess from "./StepSuccess";
import { medDAOIssuerOrigin, serverAddress } from "../../constants";
import { getCredentials } from '../../utils/secrets';
import { proveGovIdFirstNameLastName } from '../../utils/proofs';
import MintContainer from "./MintContainer";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";

const VerificationRequestForm = () => {
  const navigate = useNavigate();
  const [govIdCreds, setGovIdCreds] = useState(); 
  const { holoAuthSigDigest } = useHoloAuthSig();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();

  useEffect(() => {
    (async () => {
      const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest);
      const creds = sortedCreds[serverAddress['idgov-v2']];
      setGovIdCreds(creds);
      console.log('govIdCreds', creds);
    })();
  }, [])

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    npiNumber: "",
  });

  function handleTextInputChange(event) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const govIdFirstNameLastNameProof = await proveGovIdFirstNameLastName(govIdCreds);
      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        npiNumber: formData.npiNumber,
        proof: govIdFirstNameLastNameProof
      };
      const resp = await fetch(`${medDAOIssuerOrigin}/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      console.log('server response...')
      console.log(data);
      if (resp.status === 200 && data.id) {
        const retrievalEndpoint = `${medDAOIssuerOrigin}/verification/credentials?id=${data.id}`;
        const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint))
        navigate(`/mint/meddao/store?retrievalEndpoint=${encodedRetrievalEndpoint}`);
      }
    } catch (err) {
      console.log(err)
    }
  }

  if (!govIdCreds) {
    return (
      <>
        <div>
          <p style={{ color: 'red' }}>Error: No government ID credentials found.</p>
          <p>
            You can add government ID credentials to your Holo{" "}
            <button 
              style={{ backgroundColor: 'transparent', padding: '0px' }}
              className="in-text-link" 
              onClick={() => navigate('/mint/idgov')}
            >
              here
            </button>.
          </p>
        </div>
      </>
    )
  };
  return (
    <>
      <h3 style={{  marginTop: "-25px" }}>
        Request Verification
      </h3>
      <div style={{ fontFamily: "Montserrat", fontWeight: "100", fontSize: "14px", marginBottom: "30px",  }}>
        <form>
          <div style={{ margin: "20px" }}>
            <label htmlFor="first-name">First name</label>
            <input 
              type="text" 
              name="firstName" 
              className="text-field short-y long-x"
              value={formData.firstName}
              onChange={handleTextInputChange}
            />
          </div>
          <div style={{ margin: "20px" }}>
            <label htmlFor="last-name">Last name</label>
            <input 
              type="text"
              name="lastName" 
              className="text-field short-y long-x"
              value={formData.lastName}
              onChange={handleTextInputChange}
            />
          </div>
          <div style={{ margin: "20px" }}>
            {/* TODO: Add validation. NPI number must be 10 digits. */}
            <label htmlFor="npi-number">NPI number</label>
            <input 
              type="text" 
              name="npiNumber"
              className="text-field short-y long-x"
              value={formData.npiNumber}
              onChange={handleTextInputChange}
            />
          </div>
          {/* TODO: Disable submit button and display "submitting" while submission is in progress */}
          <button
            className="x-button secondary outline"
            style={{ width: "100%", marginLeft: 'auto' }}
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </form>
      </div>
    </>
  )
}

function useMintMedDAOCreds() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const [currentIdx, setCurrentIdx] = useState(0);

  // TODO: Do we need phone # for this?
  const steps = ["Verify", "Store", "Mint"];

  const currentStep = useMemo(() => {
    if (!store && !creds) return "Verify";
    if (store && !creds) return "Store";
    if (creds) return "Mint";
  }, [store, creds]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep])

  return {
    success,
    setSuccess,
    creds,
    setCreds,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  };
}

// TODO: Rename this to something better
const MintMedDAOCreds = () => {
  const navigate = useNavigate();
  const {
    success,
    setSuccess,
    creds,
    setCreds,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  } = useMintMedDAOCreds();

  useEffect(() => {
    if (success && window.localStorage.getItem('register-credentialType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
    }
  }, [success]);

  return (
    <MintContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : currentStep === "Verify" ? (
        <VerificationRequestForm />
      ) : currentStep === "Store" ? (
        <StoreCredentials onCredsStored={setCreds} />
      ) : (
        <MintButton onSuccess={() => setSuccess(true)} creds={creds} />
      )}
    </MintContainer>
  );
};

export default MintMedDAOCreds;
