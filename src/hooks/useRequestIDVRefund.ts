import { useMutation } from '@tanstack/react-query'
import { idServerUrl } from "../constants";

function useRequestIDVRefund() {
  return useMutation(
    async ({ refundTo, sid }: { refundTo?: string, sid: string | null }) => {
      if (refundTo && (refundTo ?? '').length !== 42) {
        throw new Error(`Invalid address (${refundTo})`);
      }
      if (!sid) {
        throw new Error(`Invalid session ID (${sid})`);
      }
  
      const resp = await fetch(`${idServerUrl}/sessions/${sid}/idv-session/refund/v2`, {
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

export default useRequestIDVRefund;
