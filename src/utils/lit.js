import LitJsSdk from "@lit-protocol/sdk-browser";
import { chainUsedForLit } from '../constants/misc';

const client = new LitJsSdk.LitNodeClient({ debug: false })

class Lit {
  litNodeClient

  async connect() {
    await client.connect()
    this.litNodeClient = client
  }

  getAccessControlConditions(address) {
    return [
      {
        contractAddress: '',
        standardContractType: '',
        chain: chainUsedForLit,
        method: '',
        parameters: [
          ':userAddress',
        ],
        returnValueTest: {
          comparator: '=',
          value: address
        }
      }
    ]
  }

  async encrypt(message, chain, accessControlConditions, litAuthSig) {
    if (!this.litNodeClient) {
      await this.connect()
    }

    const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain })
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(message)

    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    })

    return {
      encryptedString: await LitJsSdk.blobToBase64String(encryptedString),
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
    }
  }

  async decrypt(encryptedString, encryptedSymmetricKey, chain, accessControlConditions, litAuthSig) {
    if (!this.litNodeClient) {
      await this.connect()
    }

    const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain })
    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig
    })

    const encryptedStringAsBlob = LitJsSdk.base64StringToBlob(encryptedString)
    const decryptedString = await LitJsSdk.decryptString(
      encryptedStringAsBlob,
      symmetricKey
    );

    return decryptedString
  }
}

export default new Lit()