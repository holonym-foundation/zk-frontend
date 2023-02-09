import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MintButton from "./mint-button";
import StoreCredentials from "./store-credentials";
import StepSuccess from "./StepSuccess";
import { lexDAOIssuerOrigin, serverAddress } from "../../constants";
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
    email: "",
    registrationNumber: "",
    jurisdiction: "",
    consentCertification: "",
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
        email: formData.email,
        registrationNumber: formData.registrationNumber,
        jurisdiction: formData.jurisdiction,
        consentCertification: formData.consentCertification.toString(),
        proof: govIdFirstNameLastNameProof
      };
      const resp = await fetch(`${lexDAOIssuerOrigin}/verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      // TODO: Redirect user to a page with a message that they will get an email to finish the process
      console.log('server response...')
      console.log(data);
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
            <label for="first-name">First name</label>
            <input 
              type="text" 
              name="firstName" 
              className="text-field short-y long-x"
              value={formData.firstName}
              onChange={handleTextInputChange}
            />
          </div>
          <div style={{ margin: "20px" }}>
            <label for="last-name">Last name</label>
            <input 
              type="text"
              name="lastName" 
              className="text-field short-y long-x"
              value={formData.lastName}
              onChange={handleTextInputChange}
            />
          </div>
          <div style={{ margin: "20px" }}>
            <label for="email">Email</label>
            <input 
              type="text"
              name="email" 
              className="text-field short-y long-x"
              value={formData.email}
              onChange={handleTextInputChange}
            />
          </div>
          <div style={{ margin: "20px" }}>
            <label for="registration-number">Registration number</label>
            <input 
              type="text" 
              name="registrationNumber"
              className="text-field short-y long-x"
              value={formData.registrationNumber}
              onChange={handleTextInputChange}
            />
          </div>
          <div style={{ margin: "20px" }}>
            <label for="jurisdiction">Jurisdiction</label>
            <input 
              type="text"
              name="jurisdiction"
              className="text-field short-y long-x"
              value={formData.jurisdiction}
              onChange={handleTextInputChange}
            />
          </div>
          <div style={{ margin: "20px", display: 'flex' }}>
            <label for="consent-certification" style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: '10px' }}>(TODO: Update this label) Can we query a gov db on your behalf?</label>
            <input
              type="checkbox"
              name="consentCertification"
              value={formData.consentCertification}
              className="checkbox"
              onChange={(e) => setFormData({ ...formData, consentCertification: e.target.checked })}
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

function useMintLexDAOCreds() {
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
const MintLexDAOCreds = () => {
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
  } = useMintLexDAOCreds();

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

export default MintLexDAOCreds;
