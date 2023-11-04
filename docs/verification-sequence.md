# Verification Sequence

The following is a (somewhat simplified) sequence diagram of the ID verification flow.

The core data structure in this flow is the "session". You can see the snapshots of an example session in SessionValue1, SessionValue2, and SessionValue3 to see how it changes through the verification flow.

```mermaid
sequenceDiagram
    Note left of Frontend: User lands at /issuance/idgov
    Frontend->>Server: 1. Create empty session. Determine IDV provider.
    Note right of Server: (See SessionValue1)
    Server->>Frontend: 2. Return session ID.
    Note left of Frontend: User redirected to /issuance/...?sid=123
    Frontend->>Server: 3. User pays, sends tx hash to server.
    Note right of Server: Server checks tx is valid.
    Server->>IDV Provider: 5. Create IDV session.
    Server->>Frontend: 6. Return IDV session ID.
    Note right of Server: (See SessionValue2)
    Note left of Frontend: User completes IDV process.
    Note left of Frontend: User is redirected to /issuance/.../store...
    Frontend->>Server: 7. Request signed credentials.
    Note right of Server: Server checks user hasn't registered.
    Note right of Server: (See SessionValue3)
    Server->>IDV Provider: 9. Delete user info.
    Server->>Frontend: 10. Return signed credentials.
```


```javascript
SessionValue1 = {
    id: "123",
    idvProvider: "veriff",
    status: "NEEDS_PAYMENT"
}

SessionValue2 = {
    id: "123",
    idvProvider: "veriff",
    status: "IN_PROGRESS", // changed
    idvSessionId: "456", // added
    txHash: "0x123", // added
    chainId: 1 // added
}

SessionValue3 = {
    id: "123",
    idvProvider: "veriff",
    status: "ISSUED", // changed
    idvSessionId: "456",
    txHash: "0x123",
    chainId: 1
}
```

Note on nomencalture: "Session" refers to the data structure maintained by Holonym's server. "IDV session" refers to the data structure maintained by the IDV provider.
