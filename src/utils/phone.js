import { zkPhoneEndpoint } from "../constants/misc";
import axios from "axios";

var hasRequestedCode = false;
var hasRequestedCredentials = false;

export const sendCode = (phoneNumber) => {
  if (!hasRequestedCode) axios.get(zkPhoneEndpoint + "/send/" + phoneNumber);
  hasRequestedCode = true;
}

export const getCredentialsPhone = (phoneNumber, code, country, callback) => {
  axios.get(`${zkPhoneEndpoint}/getCredentials/${phoneNumber}/${code}/${country}`)
  .then((response) => callback(response.data));
}