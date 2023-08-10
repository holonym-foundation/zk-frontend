import { useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createVeriffFrame, MESSAGES } from '@veriff/incontext-sdk';
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { idServerUrl } from "../constants";

const useVeriffIDV = ({ enabled }) => {
  const queryClient = useQueryClient();
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState();

  const { holoAuthSigDigest } = useHoloAuthSig();

  const veriffSessionQuery = useQuery({
    queryKey: ['veriffSession'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/veriff/v2/session`, {
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
    onSuccess: (verification) => {
      if (!verification?.url) return;
      const handleVeriffEvent = (msg) => {
        if (msg === MESSAGES.FINISHED) {
          const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${verification.id}`
          const encodedRetrievalEndpointTemp = encodeURIComponent(window.btoa(retrievalEndpoint))
          setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp)
  
          queryClient.invalidateQueries({ queryKey: ['idvSessionStatus'] })
        }
      }
      createVeriffFrame({
        url: verification.url,
        onEvent: handleVeriffEvent
      });
    },
    staleTime: Infinity,
    enabled: enabled
  });

  return {
    encodedRetrievalEndpoint,
  }
}

export default useVeriffIDV
