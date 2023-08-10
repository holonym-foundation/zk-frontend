import { useState } from "react";
import { useQuery } from '@tanstack/react-query'
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { idServerUrl } from "../constants";

const useIdenfyIDV = ({ enabled }) => {
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState();

  const { holoAuthSigDigest } = useHoloAuthSig();

  const idenfySessionCreationQuery = useQuery({
    queryKey: ['idenfySessionCreation'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/idenfy/v2/session`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sigDigest: holoAuthSigDigest
        })
      })
      return await resp.json()
    },
    onSuccess: (data) => {
      const retrievalEndpoint = `${idServerUrl}/idenfy/credentials?scanRef=${data.scanRef}`
      const encodedRetrievalEndpointTemp = encodeURIComponent(window.btoa(retrievalEndpoint))
      setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp)
    },
    staleTime: Infinity,
    enabled: holoAuthSigDigest && enabled
  });

  return {
    canStart: !!idenfySessionCreationQuery.data?.scanRef,
    verificationUrl: idenfySessionCreationQuery.data?.url,
    encodedRetrievalEndpoint,
  }
}

export default useIdenfyIDV
