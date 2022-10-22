// Uncomment below when you want to use it -- just made it empty for faster loading and to increase traffic on Lit protocol needlessly. In the future, it should be lazy-loaded instead of commented out

// import React, { useState, useEffect } from 'react'
// import { Integration } from 'lit-ceramic-sdk'
// import contractAddresses from '../constants/contractAddresses.json'
// import abi from '../constants/abi/VerifyJWT.json'
// import { providers } from 'ethers'
// const { ethers } = require('ethers')

// // const provider = new ethers.providers.Web3Provider(window.ethereum)
// // const signer = provider.getSigner()

// let litCeramicIntegration = new Integration('https://ceramic-clay.3boxlabs.com', 'mumbai')
// litCeramicIntegration.startLitClient(window)

// const evmContractConditions = [
//     {
//       contractAddress: "0x1362fe03c3c338f2e7dfaA44205f2B047f2C430D",
//       functionName: "hasAccess",
//       functionParams: [":userAddress",":userAddress"],
//       functionAbi: {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "owner",
//             "type": "address"
//           },
//           {
//             "internalType": "address",
//             "name": "viewer",
//             "type": "address"
//           }
//         ],
//         "name": "hasAccess",
//         "outputs": [
//           {
//             "internalType": "bool",
//             "name": "result",
//             "type": "bool"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       chain: "mumbai",
//       returnValueTest: {
//         key: "result",
//         comparator: "=",
//         value: "true",
//       },
//     },
//   ];

// export const LitCeramic = (props)=> {
//     const [streamID, setStreamID] = useState(null)
//     const [streamContent, setStreamContent] = useState(null)
//     const [account, setAccount] = useState(null)
//     const [self, setSelf] = useState(null)
//     const [buttonPressed, setButtonPressed] = useState(0) // this should be incremented (or somehow changed) on every button press so it triggers a useEffect
//     // get ethereum account
//     props.provider.request({
//     method: 'eth_requestAccounts',
//     })
//     .then(accounts=>setAccount(accounts[0]))

//     // upload content to stream when page loads
//     const uploadPrivateCredentials = ()=>{
//         litCeramicIntegration.encryptAndWrite(props.stringToEncrypt, evmContractConditions, 'evmContractConditions').then(streamID => setStreamID(streamID))
//     }

//     // Changes to's access to newState (true or false)
//     const changeAccess = async (to, newState) => {
//       console.log(contractAddresses['google'])
//       let vjwt = new ethers.Contract(contractAddresses['google'], abi, props.provider.getSigner())
//       vjwt.setAccess(to, newState)
//     }

//     // Decodes a base64url JWT
//     const decodeJWT = (jwt)=>{
//       if(!jwt){return}
//       console.log('decode', jwt)
//       return jwt.split('.').map(x=>atob(x)).join(',')
//     }

//     // load stream from ceramic when streamID changes or 'View Credentials' is pressed
//     useEffect(()=>{
//         if(streamID){
//             try {
//                 litCeramicIntegration.readAndDecrypt(streamID).then(c=>setStreamContent(c))
//             } catch {
//                 setStreamContent('Error: You don\'t have access to it') // this never gets called javascript error handling is terrible - hacky workaround is done instead of this
//             }

//         }
//     }, [streamID, buttonPressed])

//     return <>
//         <button className='cool-button' onClick={uploadPrivateCredentials}>Finish Uploading Your Private Credentials</button>
//         then
//         <button className='cool-button' onClick={async ()=> await changeAccess(account, true)}>Grant (Me) Access</button>
//         <button className='cool-button' onClick={async ()=> await changeAccess(account, false)}>Revoke (My) Access</button>
//         <button className='cool-button' onClick={()=>setButtonPressed( buttonPressed +1 ) }>View Credentials</button>
//         {streamID ? `Saved to streamID ${streamID} ,` : null}
//         <i>Content :</i>{streamContent && streamContent.startsWith('something went wrong decrypting:') ? <b>Error: Could not access the content</b> : <p style={{fontSize:'12px'}}>{decodeJWT(streamContent)}</p>}
//     </>
// }

// Uncomment above when you want to use it -- just made it empty for faster loading and to increase traffic on Lit protocol needlessly. In the future, it should be lazy-loaded instead of commented
export const LitCeramic = () => <></>;
