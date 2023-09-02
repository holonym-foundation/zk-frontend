import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createVeriffFrame, MESSAGES } from "@veriff/incontext-sdk";
import { idServerUrl } from "../constants";

const useVeriffIDV = ({ url, sessionId }: { url?: string, sessionId?: string }) => {
  const queryClient = useQueryClient();
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState("");

  const veriffIframeCreatedRef = useRef(false);

  useEffect(() => {
    if (!url || veriffIframeCreatedRef.current)
      return;
    veriffIframeCreatedRef.current = true;

    const handleVeriffEvent = (msg: MESSAGES) => {
      if (msg === MESSAGES.FINISHED) {
        const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${sessionId}`;
        const encodedRetrievalEndpointTemp = encodeURIComponent(
          window.btoa(retrievalEndpoint)
        );
        setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp);

        queryClient.invalidateQueries({ queryKey: ["idvSessionStatus"] });
      }
    };
    createVeriffFrame({
      url: url,
      onEvent: handleVeriffEvent,
    });
  }, [url, sessionId]);

  return {
    encodedRetrievalEndpoint,
  };
};

export default useVeriffIDV;
