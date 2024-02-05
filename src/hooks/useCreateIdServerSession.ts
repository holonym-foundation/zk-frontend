import { useMutation } from "@tanstack/react-query";
import { idServerUrl } from "../constants";
import { useHoloAuthSig } from "../context/HoloAuthSig";

function useCreateIdServerSession({ preferredProvider }: { preferredProvider?: string }) {
  const { holoAuthSigDigest } = useHoloAuthSig();

  return useMutation(
    async () => {
      if (!preferredProvider) throw new Error("No preferred provider");
      const resp = await fetch(`${idServerUrl}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sigDigest: holoAuthSigDigest,
          idvProvider: preferredProvider,
          domain: "app.holonym.id"
        }),
      })
  
      if (!resp.ok) {
        throw new Error("Failed to create session")
      }
  
      return resp.json()
    }
  )
}

export default useCreateIdServerSession
