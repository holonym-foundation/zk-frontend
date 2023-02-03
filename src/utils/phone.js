import { zkPhoneEndpoint } from "../constants";
import axios from "axios";

var hasRequestedCode = false;
var hasRequestedCredentials = false;

export const sendCode = (phoneNumber) => {
  if (!hasRequestedCode) axios.get(zkPhoneEndpoint + "/send/" + phoneNumber);
  hasRequestedCode = true;
}

export const getCredentialsPhone = (phoneNumber, code, country, callback, errCallback) => {
    console.log("abcdef")
  axios.get(`${zkPhoneEndpoint}/getCredentials/${phoneNumber}/${code}/${country}`)
  .then((response) => callback(response.data))
  .catch((e) => { console.error(e.response.data); errCallback(e.response.data) });
}