import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createVeriffFrame, MESSAGES } from "@veriff/incontext-sdk";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { idServerUrl } from "../constants";

const useVeriffIDV = ({ enabled }: { enabled: boolean }) => {
  const queryClient = useQueryClient();
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState("");

  const { holoAuthSigDigest } = useHoloAuthSig();

  const veriffSessionQuery = useQuery({
    queryKey: ["veriffSession"],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/veriff/v2/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sigDigest: holoAuthSigDigest,
        }),
      });
      return await resp.json();
    },
    staleTime: Infinity,
    enabled: enabled,
  });

  const veriffIframeCreatedRef = useRef(false);

  useEffect(() => {
    if (!veriffSessionQuery?.data?.url || veriffIframeCreatedRef.current)
      return;
    veriffIframeCreatedRef.current = true;

    const handleVeriffEvent = (msg: MESSAGES) => {
      if (msg === MESSAGES.FINISHED) {
        const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${veriffSessionQuery?.data?.id}`;
        const encodedRetrievalEndpointTemp = encodeURIComponent(
          window.btoa(retrievalEndpoint)
        );
        setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp);

        queryClient.invalidateQueries({ queryKey: ["idvSessionStatus"] });
      }
    };
    createVeriffFrame({
      url: veriffSessionQuery?.data?.url,
      onEvent: handleVeriffEvent,
    });
  }, [veriffSessionQuery.data]);

  return {
    encodedRetrievalEndpoint,
  };
};

export default useVeriffIDV;
