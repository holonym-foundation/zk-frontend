# Top level Architecture Review

```typescript
type Secret = string;
type Address = string;
type CypherText = string; // blob 
type Proof = { }; // line 143 on proof.js console.logs to get the shape.

interface AuthenticatedResult<T> {
  signature: string; // (hash of response + secret + address),
  secret: Secret; //
  payload: T; //
  address: Address; //
}

interface VouchedCredentials {};
type VouchedAuthenticationResult = AuthenticatedResult<VouchedCredentials>;
type TransactionResult = {} // ('ethers.js' transaction);

```

## Secrets: old/new

## Client Create Proof Process

1. Calls id_server with jobId, id server returns `const issuer_response = Promise<VouchedAuthenticationResult>`
2. Generates a `const new_secret = createNewSecret();`
3. Encrypts cypher_text `const cypher_text = encript(issuer_response.payload, new_secret);`
4. Stored creds `keyStorage.store(cypher_text);`
5. Creates a zk-proof `const zk: ZKProof = createZkProof(issuer_response.payload, issuer_response.secret, new_secret)`
6. Calls relayer: `const tx = await relayerClient.addLeaf(zk, cypher_text, issuer_response.payload, new_secret, issuer_response.secret, issuer_response.address, issuer.signature)`. The relayer client calls `addLeaf` in `Hub.sol` (contract) passing all arguments sans the cypher_text. (omit<args,cypher_text>);

```solidity
  function addLeaf(address issuer, uint8 v, bytes32 r, bytes32 s, Proof memory proof, uint[3] memory input) public
```

### TODO @amos/@caleb

- forwards cypher_text to the id server (signature_digest, encrypted_credentials, encrypted_symetric_key, cypher_text)
       id server stores a hashtable that associates cypher_text[] with a signature;
- return transaction
restore cypher_text(hash)
logicall seperated:
creating another proof after the lead was added.

```typescript

interface HolonymProcess<T> {
  // both verifies the truthfulness of the id, and pushes it to the merker tree.
  authenticate: (key: T['id']) => Promise<AuthenticatedResult<T['payload']>>
  encript: (creds: AuthenticatedResult<T['payload']>) => Promise<CypherText>;
  storeCypher: (cypher: CypherText) => Promise<boolean>;
  addLeafProof: (payload: T['payload']) => Promise<Proof>;
  relayer: (cypher: CypherText, proof: Proof) => Promise<TransactionResult>;
}

interface CryptoSignature {
  adderess: string;
  message: string;
  signature: string;
}

type ValidateCryptoSignature = (sign: CryptoSignature) => boolean;
type CreateCryptoSignature = (address: string, message: string) => CryptoSignature;

interface Condition { };

interface Lit {
  // symetric key for each piece of data, per each access control condition it will generate a key
  keys: string[];

  decript(signature: CryptoSignature, conditions: [Condition]): Promise<{

  }>;

  encript(signature: CryptoSignature, conditions: [Condition]): Promise<{
    keys: string[];
    callback(result): void;
  }>;
}

interface LitT {
  accessControl: string[];
}

interface SignedCoding<T> {
  encypt(value: T): Promise<any>;
  decrypt(): Promise<any>;
}

class LitSignedCoding implements SignedCoding<LitT> {

}

class NativeLocalKeyStrageCoding implements SignedCoding<{

}> {

}

/**
 * 
 */
class CryptoSignatureStorage<T> {
  constructor(private signature: CryptoSignature, provider: SignedCoding<T>) { }
}
```
