import { zkPhoneEndpoint } from "../constants";
import axios from "axios";

var hasRequestedCode = false;

export const sendCode = (phoneNumber: string) => {
  if (!hasRequestedCode) axios.get(`${zkPhoneEndpoint}/send/v3/${phoneNumber}`);
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
