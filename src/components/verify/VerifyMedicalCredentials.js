import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import FinalStep from "./FinalStep";
import StepSuccess from "./StepSuccess";
import { medDAOIssuerOrigin, serverAddress } from "../../constants";
import VerificationContainer from "./VerificationContainer";
import { useProofs } from "../../context/Proofs";
import { useCreds } from "../../context/Creds";

const initialFormValues = {
  firstName: "",
  lastName: "",
  npiNumber: "",
};
const validationSchema = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  npiNumber: Yup.string()
    .required("Required")
    .matches(/^\d{10}$/, "NPI number must be 10 digits"),
});

const VerificationRequestForm = () => {
  const navigate = useNavigate();
  const [govIdCreds, setGovIdCreds] = useState(); 
  const [error, setError] = useState();
  const { govIdFirstNameLastNameProof } = useProofs();
  const { sortedCreds, loadingCreds } = useCreds();

  useEffect(() => {
    if (loadingCreds) return;
    (async () => {
      const creds = sortedCreds[serverAddress['idgov-v2']];
      setGovIdCreds(creds);
      console.log('govIdCreds', creds);
    })();
  }, [sortedCreds, loadingCreds])

  async function onSubmit(values, { setSubmitting }) {
    try {
      const body = {
        firstName: values.firstName,
        lastName: values.lastName,
        npiNumber: values.npiNumber,
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
        navigate(`/verify/med/store?retrievalEndpoint=${encodedRetrievalEndpoint}`);
      } else if (data.error && data.message) {
        if (data.message.includes('Unsupported specialty')) {
          setError('This specialty is not supported yet but is in development.');
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <>
        <div>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </>
    );
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
              onClick={() => navigate('/verify/idgov')}
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
        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div style={{ margin: "20px" }}>
                <label htmlFor="first-name">First name</label>
                <Field
                  type="text"
                  name="firstName"
                  className="text-field short-y long-x"
                />
                <ErrorMessage name="firstName" style={{ color: "red" }} />
              </div>
              <div style={{ margin: "20px" }}>
                <label htmlFor="last-name">Last name</label>
                <Field
                  type="text"
                  name="lastName"
                  className="text-field short-y long-x"
                />
                <ErrorMessage name="lastName" style={{ color: "red" }} />
              </div>
              <div style={{ margin: "20px" }}>
                <label htmlFor="npi-number">NPI number</label>
                <Field
                  type="text"
                  name="npiNumber"
                  className="text-field short-y long-x"
                />
                <ErrorMessage name="npiNumber" style={{ color: "red" }} />
              </div>
              <button
                className="x-button secondary outline"
                style={{ width: "100%", marginLeft: "auto" }}
                type="submit"
                disabled={isSubmitting || !govIdFirstNameLastNameProof}
              >
                {isSubmitting ? "Submitting..." : !govIdFirstNameLastNameProof ? "Loading proof..." : "Submit"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </>
  )
}

function useVerifyMedicalCredentials() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [currentIdx, setCurrentIdx] = useState(0);

  // TODO: Do we need phone # for this?
  const steps = ["Verify", "Finalize"];

  const currentStep = useMemo(() => {
    if (!store) return "Verify";
    if (store) return "Finalize";
  }, [store]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep])

  return {
    success,
    setSuccess,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  };
}

const VerifyMedicalCredentials = () => {
  const navigate = useNavigate();
  const {
    success,
    setSuccess,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  } = useVerifyMedicalCredentials();

  useEffect(() => {
    if (success && window.localStorage.getItem('register-credentialType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
    }
  }, [success]);

  return (
    <VerificationContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : currentStep === "Verify" ? (
        <VerificationRequestForm />
      ) : ( // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default VerifyMedicalCredentials;
