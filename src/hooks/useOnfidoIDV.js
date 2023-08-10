import { useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  init as initOnfido
} from 'onfido-sdk-ui'
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { idServerUrl } from "../constants";

const useOnfidoIDV = ({ enabled }) => {
  const queryClient = useQueryClient();
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState();

  const { holoAuthSigDigest } = useHoloAuthSig();

  const { data: applicant } = useQuery({
    queryKey: ['onfidoApplicant'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/onfido/applicant`, {
        method: "POST",
      })
      return await resp.json()
    },
    staleTime: Infinity,
    enabled: enabled,
  })

  const { data: check, refetch: refetchCheck } = useQuery({
    queryKey: ['onfidoCheck'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/onfido/v2/check`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicant_id: applicant.applicant_id,
          sigDigest: holoAuthSigDigest,
        })
      })
      return await resp.json()
    },
    onSuccess: (data) => {
      // Navigate to retrievalEndpoint when user is approved
      const retrievalEndpoint = `${idServerUrl}/onfido/credentials?check_id=${data.id}`
      const encodedRetrievalEndpointTemp = encodeURIComponent(window.btoa(retrievalEndpoint))
      setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp)

      queryClient.invalidateQueries({ queryKey: ['idvSessionStatus'] })
    },
    enabled: false,
  })

  const { data: onfidoOut } = useQuery({
    queryKey: ['initOnfido'],
    queryFn: async () => {
      let onfido = {};

      // NOTE: Must call `await onfidoOut.safeTearDown()` when done, if you want to
      // re-initialize the SDK.

      onfido = initOnfido({
        token: applicant.sdk_token,
        containerId: 'onfido-mount',
        // containerEl: <div id="root" />, // ALTERNATIVE to `containerId`
        useModal: true,
        isModalOpen: true,
        smsNumberCountryCode: 'US', // TODO: Take user input for this
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
          console.log('onfido: everything is complete. data:', data)
          onfido.setOptions({ isModalOpen: false })
          refetchCheck()
        },
        onError: (error) => {
          console.log('onfido: error', error)
        },
        onUserExit: (userExitCode) => {
          console.log('onfido: user exited', userExitCode)
        },
        onModalRequestClose: () => {
          console.log('onfido: modal closed')
          onfido.setOptions({ isModalOpen: false })
        }
      })

      return onfido
    },
    staleTime: Infinity,
    enabled: enabled && !!applicant?.sdk_token
  })

  return {
    encodedRetrievalEndpoint
  }
}

export default useOnfidoIDV
