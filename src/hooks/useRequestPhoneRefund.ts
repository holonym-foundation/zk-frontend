import { useMutation } from '@tanstack/react-query'
import { zkPhoneEndpoint } from "../constants";

function useRequestPhoneRefund() {
  return useMutation(
    async ({ refundTo, id }: { refundTo: string, id: string | null }) => {
      if (!refundTo || refundTo.length !== 42) {
        throw new Error(`Invalid address (${refundTo})`);
      }
      if (!id) {
        throw new Error(`Invalid session ID (${id})`);
      }
  
      const resp = await fetch(`${zkPhoneEndpoint}/sessions/${id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: refundTo })
      })
      const data = await resp.json()
      if (resp.status !== 200) throw new Error(`${data.error}`)
      return data
    }
  )
}

export default useRequestPhoneRefund;
