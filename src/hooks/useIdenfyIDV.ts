import { useMemo } from "react";
import { idServerUrl } from "../constants";

const useIdenfyIDV = ({ scanRef }: { scanRef?: string }) => {
  const encodedRetrievalEndpoint = useMemo(() => {
    const retrievalEndpoint = `${idServerUrl}/idenfy/credentials?scanRef=${scanRef}`;
    return encodeURIComponent(window.btoa(retrievalEndpoint));
  }, [scanRef]);

  return {
    encodedRetrievalEndpoint,
  };
};

export default useIdenfyIDV;
