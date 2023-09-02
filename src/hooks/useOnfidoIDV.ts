import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { init as initOnfido, SdkHandle } from "onfido-sdk-ui";
import { idServerUrl } from "../constants";

const useOnfidoIDV = ({ enabled, sdk_token }: { enabled: boolean, sdk_token?: string }) => {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");
  const queryClient = useQueryClient();
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState("");

  const { data: check, refetch: refetchCheck } = useQuery({
    queryKey: ["onfidoCheck"],
    queryFn: async () => {
      if (!sid) throw new Error("No sid provided");
      const resp = await fetch(`${idServerUrl}/sessions/${sid}/idv-session/onfido/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      return resp.json();
    },
    onSuccess: (data) => {
      // Navigate to retrievalEndpoint when user is approved
      const retrievalEndpoint = `${idServerUrl}/onfido/credentials?check_id=${data.id}`;
      const encodedRetrievalEndpointTemp = encodeURIComponent(
        window.btoa(retrievalEndpoint)
      );
      setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp);

      queryClient.invalidateQueries({ queryKey: ["idvSessionStatus"] });
    },
    enabled: false,
  });

  const { data: onfidoOut } = useQuery({
    queryKey: ["initOnfido"],
    queryFn: async () => {
      let onfido: SdkHandle | any = {};

      // NOTE: Must call `await onfidoOut.safeTearDown()` when done, if you want to
      // re-initialize the SDK.

      onfido = initOnfido({
        token: sdk_token,
        containerId: "onfido-mount",
        // containerEl: <div id="root" />, // ALTERNATIVE to `containerId`
        useModal: true,
        isModalOpen: true,
        smsNumberCountryCode: "US", // TODO: Take user input for this
        // TODO: Low priority feature for improved UX: If the user already has phone
        // number creds, specify those here so that they don't have to re-enter their
        // phone number.
        // userDetails: {
        //   smsNumber: '+447500123456'
        // },
        // steps: [
        //   'welcome',
        //   'document',
        //   'face',
        //   'complete'
        // ],
        onComplete: (data) => {
          console.log("onfido: everything is complete");
          onfido.setOptions({ isModalOpen: false });
          refetchCheck();
        },
        onError: (error) => {
          console.log("onfido: error", error);
        },
        onUserExit: (userExitCode) => {
          console.log("onfido: user exited", userExitCode);
        },
        onModalRequestClose: () => {
          console.log("onfido: modal closed");
          onfido.setOptions({ isModalOpen: false });
        },
      });

      return onfido;
    },
    staleTime: Infinity,
    enabled: enabled && !!sdk_token,
  });

  return {
    encodedRetrievalEndpoint,
  };
};

export default useOnfidoIDV;
