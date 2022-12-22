import { v4 } from "uuid";
import { VERIFF_PUBLIC_API_KEY } from "../constants/misc";

export async function createVeriffSession() {
  const reqBody = {
    verification: {
      callback: process.NODE_ENV === 'development' ? "http://localhost:3002/mint/" : "https://holonym.id/mint",
      document: {
        type: "DRIVERS_LICENSE",
      },
      vendorData: v4(),
      timestamp: new Date().toISOString(),
    },
  }
  if (process.NODE_ENV === 'development') {
    reqBody.verification.person = {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-01",
    }
  }
  const resp = await fetch("https://stationapi.veriff.com/v1/sessions", {
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
      "x-auth-client": VERIFF_PUBLIC_API_KEY,
    },
    method: "POST",
    cache: "no-store",
  });
  return await resp.json();
}
