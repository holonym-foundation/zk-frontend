// Ceramic Self.ID
import React, { useState, useEffect } from 'react'
import { EthereumAuthProvider, SelfID } from '@self.id/web'

export const ConnectButton = () => {
  const [account, setAccount] = useState(null)
  const [self, setSelf] = useState(null)
  // get ethereum account
  window.ethereum.request({
  method: 'eth_requestAccounts',
  })
  .then(accounts=>setAccount(accounts[0]))

  // The following configuration assumes your local node is connected to the Clay testnet
  SelfID.authenticate({
    authProvider: new EthereumAuthProvider(window.ethereum, account),
    ceramic: 'local',
    connectNetwork: 'testnet-clay',
  })
  .then(self=>setSelf(self))
  return <a>h</a>
}