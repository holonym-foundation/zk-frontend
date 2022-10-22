import LitJsSdk from 'lit-js-sdk'


// Initialize LIT
litDoneLoading = false
const client = new LitJsSdk.LitNodeClient()
await client.connect()
window.litNodeClient = client
document.addEventListener('lit-ready', ()=>{litDoneLoading = true}, false)

// 
const authSig = await LitJsSdk.checkAndSignAuthMessage({chain: 'ethereum'})


const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
    'this is a secret message'
  );
const accessControlConditions = [
    {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'hasAccess',
        parameters: [
        ':userAddress',
        ],
        returnValueTest: {
        comparator: '>',
        value: '='
        }
    }
]

const encryptedSymmetricKey = await window.litNodeClient.saveEncryptionKey({
    accessControlConditions,
    symmetricKey,
    authSig,
    chain,
  });


export const PrivateCredentials = ()=><p>heylakjdfhbalksdbj;</p>