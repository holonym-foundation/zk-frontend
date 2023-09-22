import { zkPhoneEndpoint } from "../constants";
import axios from "axios";

let hasRequestedCode = false;

export const sendCode = (phoneNumber: string, sessionId: string) => {
  if (!hasRequestedCode) {
    axios.post(
      `${zkPhoneEndpoint}/send/v4/`,
      {
        number: phoneNumber,
        sessionId: sessionId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  hasRequestedCode = true;
};

export const getCredentialsPhone = (
  phoneNumber: string,
  code: string,
  country: string,
  callback: (args: any) => void,
  errCallback: (args: any) => void
) => {
  axios
    .get(`${zkPhoneEndpoint}/getCredentials/${phoneNumber}/${code}/${country}`)
    .then((response) => callback(response.data))
    .catch((e) => {
      console.error(e.response.data);
      errCallback(e.response.data);
    });
};
