import { useMutation } from "@tanstack/react-query";
import { zkPhoneEndpoint } from "../constants";
import { useHoloAuthSig } from "../context/HoloAuthSig";

function useCreatePhoneServerSession() {
  const { holoAuthSigDigest } = useHoloAuthSig();

  return useMutation(
    async () => {
      const resp = await fetch(`${zkPhoneEndpoint}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sigDigest: holoAuthSigDigest,
        }),
      })
  
      if (!resp.ok) {
        throw new Error("Failed to create session")
      }
  
      return resp.json()
    }
  )
}

export default useCreatePhoneServerSession
