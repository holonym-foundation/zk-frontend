// import { render, screen } from '@testing-library/react';
// import React from 'react';

// const App = () => {
//   return <div>App</div>;
// };

// test('renders the landing page', () => {
//   render(<App />);
// });

import { randomBytes } from 'crypto'
// import { renderHook, waitFor, act } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import { poseidon } from 'circomlibjs-old';
import useRetrieveNewCredentials from "../../hooks/IssuanceFinalStep/useRetrieveNewCredentials"
import useAddNewSecret from "../../hooks/IssuanceFinalStep/useAddNewSecret"
import useMergeCreds from "../../hooks/IssuanceFinalStep/useMergeCreds"

global.crypto = {
  getRandomValues: (typedArray) => {
    typedArray.set(randomBytes(typedArray.length))
  }
};

global.window = {};

const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => {
      return store[key] || null;
    },
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      store[key] = undefined;
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

jest.mock('../../utils/proofs', () => {
  const poseidon = require('circomlibjs-old').poseidon;
  return {
    ...jest.requireActual('../../utils/proofs'),
    createLeaf: (args) => 
      new Promise((resolve) => resolve(poseidon(args).toString())),
  }
});

jest.mock('../../web-workers/proofs.worker.js', () => {
  return {
    postMessage: jest.fn(),
    onmessage: jest.fn(),
  }
});

jest.mock('../../context/HoloKeyGenSig', () => ({
  ...jest.requireActual('../../context/HoloKeyGenSig'),
  useHoloKeyGenSig: () => {
    return {
      holoKeyGenSig: '123',
      holoKeyGenSigDigest: '1111111111111111111111111111111111111111111111111111111111111111',
    };
  }
}));

jest.mock('../../context/HoloAuthSig', () => ({
  ...jest.requireActual('../../context/HoloAuthSig'),
  useHoloAuthSig: () => {
    return {

    }
  }
}));

// jest.mock('../../context/Creds', () => ({
//   ...jest.requireActual('../../context/Creds'),
//   useCreds: () => {
//     return {
//     }
//   }
// }));
// TODO: How can we mock and tear down on a per-test basis?
jest.mock('../../context/Creds', () => ({
  ...jest.requireActual('../../context/Creds'),
  useCreds: () => {
    return {
      reloadCreds: async () => (
        {
          '0xISSUER123': {
            creds: {},
            leaf: "",
            newLeaf: "",
            metadata: {},
            pubkey: {},
            signature: {}
          },
        }
      )
    }
  }
}));

const validCredsFromMockIdServerIssuer = {
  creds: {
     customFields: [
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        "0x157c1cd1baa1b476d697324439e45668c701068235271bc7f1ab41dd8ee73b85"
     ],
     iat: "0x00000000000000000000000000000000000000000000000000000000e7bde8ce",
     issuerAddress: "0x2a4879fe71757462a1a7e103646bbc3349a15bd52b115153791da39b5e376bb0",
     scope: "0x0000000000000000000000000000000000000000000000000000000000000000",
     secret: "0x15d564dba873366c3f0926524d4340bdcac904aab6a0a63ed13e6e2788c7dadd",
     serializedAsPreimage: [
        "0x2a4879fe71757462a1a7e103646bbc3349a15bd52b115153791da39b5e376bb0",
        "0x15d564dba873366c3f0926524d4340bdcac904aab6a0a63ed13e6e2788c7dadd",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        "0x157c1cd1baa1b476d697324439e45668c701068235271bc7f1ab41dd8ee73b85",
        "0x00000000000000000000000000000000000000000000000000000000e7bde8ce",
        "0x0000000000000000000000000000000000000000000000000000000000000000"
     ]
  },
  leaf: "0x17cc9aa1178d8e6a44c1774a9721f0ed5abce7a6ccf49ad6a03862a2d7ab9f12",
  metadata: {
     derivedCreds: {
        addressHash: {
           derivationFunction: "poseidon",
           inputFields: [
              "rawCreds.city",
              "rawCreds.subdivision",
              "rawCreds.zipCode",
              "derivedCreds.streetHash.value"
           ],
           value: "17213269051117435556051219503291950994606806381770319609350243626357241456114"
        },
        nameDobCitySubdivisionZipStreetExpireHash: {
           derivationFunction: "poseidon",
           inputFields: [
              "derivedCreds.nameHash.value",
              "rawCreds.birthdate",
              "derivedCreds.addressHash.value",
              "rawCreds.expirationDate"
           ],
           value: "9717857759462285186569434641069066147758238358576257073710143504773145901957"
        },
        nameHash: {
           derivationFunction: "poseidon",
           inputFields: [
              "rawCreds.firstName",
              "rawCreds.middleName",
              "rawCreds.lastName"
           ],
           value: "19262609406206667575009933537774132284595466745295665914649892492870480170698"
        },
        streetHash: {
           derivationFunction: "poseidon",
           inputFields: [
              "rawCreds.streetNumber",
              "rawCreds.streetName",
              "rawCreds.streetUnit"
           ],
           value: "17873212585024051139139509857141244009065298068743399015831877928660937058344"
        }
     },
     fieldsInLeaf: [
        "issuer",
        "secret",
        "rawCreds.countryCode",
        "derivedCreds.nameDobCitySubdivisionZipStreetExpireHash.value",
        "rawCreds.completedAt",
        "scope"
     ],
     rawCreds: {
        birthdate: "1950-01-01",
        city: "New York",
        completedAt: "2022-09-16",
        countryCode: 2,
        expirationDate: "2023-09-16",
        firstName: "Satoshi",
        lastName: "Nakamoto",
        middleName: "Bitcoin",
        streetName: "Main St",
        streetNumber: 123,
        streetUnit: "",
        subdivision: "NY",
        zipCode: 12345
     }
  },
  pubkey: {
     x: "0x21ab92e8eab6c3c4769cef7bf4361b3ddb77957d4bbae1fa1caca8f3242ef505",
     y: "0x2c408e3e54b72cc93aa5b5b22e7b05f09bdb1ddbf64fa844b21d7028bb9a430a"
  },
  signature: {
     R8: {
        x: "0x044d557abf4bdfd742d6ec02ddf41b9fbff53d0832de12eb1946bcb0115429b4",
        y: "0x1c493c0f628c96678bbb099e77a5d5f37b67e3202cbae2ad87dad8900872b148"
     },
     S: "0x501e2ffce9f9ad855a9d0315449fcd551cbd80d722f28a79bfb0103d3472527"
  }
}

// const validCredsFromMockIdServerIssuerWithNewSecret = {
//   ...validCredsFromMockIdServerIssuer,
//   creds: {
//     ...validCredsFromMockIdServerIssuer.creds,
//     newSecret: "0x00",
//     serializedAsNewPreimage: [
//       "0x2a4879fe71757462a1a7e103646bbc3349a15bd52b115153791da39b5e376bb0",
//       "0x00",
//       "0x0000000000000000000000000000000000000000000000000000000000000002",
//       "0x157c1cd1baa1b476d697324439e45668c701068235271bc7f1ab41dd8ee73b85",
//       "0x00000000000000000000000000000000000000000000000000000000e7bde8ce",
//       "0x0000000000000000000000000000000000000000000000000000000000000000"
//     ]
//   },
//   newLeaf: "17361148687935615103964253102633676710222154436928152682250937993664674839353"
// }

// TODO: The test that must be written involves testing that, even if the FinalStep component
// renders multiple times within a short period of time (i.e., less than ~500ms)--resulting
// in the useEffect(() => ..., []) being called multiple times--only a single leaf and secret
// are computed, added to creds, and submitted to the relayer.

// TODO: Test that, if fetch(<retrievalEndpoint>) returns creds that are also returned by
// reloadCreds(), then credsThatWillBeOverwritten and confirmationModalVisible are all set 
// to the correct values and that calling onConfirmOverwrite or onDenyOverwrite results in
// the correct state changes.

// TODO: Test that, if fetch(<retrievalEndpoint>) returns creds that are NOT returned by
// reloadCreds(), then credsThatWillBeOverwritten and confirmationModalVisible are not
// changed.

describe('useRetrieveNewCredentials', () => {
  
  beforeEach(() => {
    // Clear sessionStorage
    sessionStorage.clear();

    // Save the original fetch function
    // originalFetch = global.fetch;

    // Clear any mocked functions or modules
    // jest.resetAllMocks();
  });

  // afterEach(() => {
  //   // Restore the original fetch function
  //   global.fetch = originalFetch;
  // });

  test('Returns valid newCreds and no error if GET <retrievalEndpoint> returns valid credentials', async () => {
    // Setup mocks
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        json: async () => Promise.resolve(validCredsFromMockIdServerIssuer),
        text: () => Promise.resolve(''),
      });
    });

    // Setup test
    let error = undefined;
    const { result, waitForNextUpdate } = renderHook(() => useRetrieveNewCredentials({ 
      setError: (errorTemp) => {
        error = errorTemp;
      },
      retrievalEndpoint: '123',
    }));
    await waitForNextUpdate();

    // Assert
    expect(result.current.newCreds).toEqual(validCredsFromMockIdServerIssuer);
    expect(error).toBe(undefined);
  });

  test('Returns valid newCreds and no error if both (a) the response status of GET <retrievalEndpoint> is 404 and (b) credentials are cached in sessionStorage', async () => {
    const retrievalEndpoint = '123'
    // Setup mocks
    const errorMessage = 'Error: User not found'
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        status: 404,
        json: async () => Promise.resolve(),
        text: () => Promise.resolve(errorMessage),
      });
    });
    sessionStorage.setItem(`holoNewCredsFromIssuer-${retrievalEndpoint}`, JSON.stringify(validCredsFromMockIdServerIssuer));

    // Setup test
    let error = undefined;
    const { result } = renderHook(() => useRetrieveNewCredentials({
      setError: (errorTemp) => {
        error = errorTemp;
      },
      retrievalEndpoint,
    }));

    // Assert
    expect(result.current.newCreds).toEqual(validCredsFromMockIdServerIssuer);
    expect(error).toBe(undefined);
  });

  test('Returns valid newCreds and no error in the case that both (a) fetch throws an error and (b) credentials are cached in sessionStorage', async () => {
    const retrievalEndpoint = '123'
    // Setup mocks
    const errorMessage = 'TypeError: Failed to fetch'
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.reject(new Error(errorMessage));
    });
    sessionStorage.setItem(`holoNewCredsFromIssuer-${retrievalEndpoint}`, JSON.stringify(validCredsFromMockIdServerIssuer));

    // Setup test
    let error = undefined;
    const { result } = renderHook(() => useRetrieveNewCredentials({
      setError: (errorTemp) => {
        error = errorTemp;
      },
      retrievalEndpoint,
    }));

    // Assert
    expect(result.current.newCreds).toEqual(validCredsFromMockIdServerIssuer);
    expect(error).toBe(undefined);
  });

  test('Returns empty newCreds and an error if both (a) the response status of GET <retrievalEndpoint> is 404 and (b) no credentials are cached in sessionStorage', async () => {
    // Setup mocks
    const errorMessage = 'Error: User not found'
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        status: 404,
        json: async () => Promise.resolve(),
        text: () => Promise.resolve(errorMessage),
      });
    });

    // Setup test
    let error = undefined;
    const { result, waitFor } = renderHook(() => useRetrieveNewCredentials({ 
      setError: (errorTemp) => {
        error = errorTemp;
      },
      retrievalEndpoint: '123',
    }));

    // Assert
    expect(result.current.newCreds).toEqual(undefined);
    await waitFor(() => {
      expect(error?.message).toEqual(errorMessage);
    });
  });

  test('Returns newCreds returned by fetch call and no error if GET <retrievalEndpoint> returns valid credentials and there are old creds cached in sessionStorage', async () => {
    const retrievalEndpoint = '123'
    // Setup mocks
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        json: async () => Promise.resolve(validCredsFromMockIdServerIssuer),
        text: () => Promise.resolve(''),
      });
    });
    const oldCreds = { 
      ...validCredsFromMockIdServerIssuer, 
      creds: {
        ...validCredsFromMockIdServerIssuer.creds,
        iat: '0xDIFFERENT'
      }
    };
    sessionStorage.setItem(`holoNewCredsFromIssuer-${retrievalEndpoint}`, JSON.stringify(oldCreds));

    // Setup test
    let error = undefined;
    const { result, waitForNextUpdate } = renderHook(() => useRetrieveNewCredentials({ 
      setError: (errorTemp) => {
        error = errorTemp;
      },
      retrievalEndpoint: '123',
    }));
    await waitForNextUpdate();

    // Assert
    expect(result.current.newCreds).toEqual(validCredsFromMockIdServerIssuer);
    expect(error).toBe(undefined);
  });

  test('Returns empty newCreds and an error if both (a) an error is thrown during fetch call and (b) no credentials are cached in sessionStorage', async () => {
    // Setup mocks
    const errorMessage = 'Error: User not found'
    jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.reject(new Error(errorMessage));
    });

    // Setup test
    let error = undefined;
    const { result, waitFor } = renderHook(() => useRetrieveNewCredentials({
      setError: (errorTemp) => {
        error = errorTemp;
      },
      retrievalEndpoint: '123',
    }));

    // Assert
    expect(result.current.newCreds).toEqual(undefined);
    await waitFor(() => {
      expect(error?.message).toEqual(errorMessage);
    });
  });

  test('Returns empty newCreds if retrievalEndpoint is undefined', async () => {
    // Setup test
    const { result, waitForNextUpdate } = renderHook(() => useRetrieveNewCredentials({ 
      setError: () => {},
      retrievalEndpoint: undefined,
    }));
    // Assert. Expect no update.
    expect(result.current.newCreds).toBe(undefined);
    let erred = false;
    try {
      await waitForNextUpdate({ timeout: 500 });
    } catch (err) {
      if (err?.message?.includes('Timed out in waitForNextUpdate after 500ms')) {
        erred = true;
      }
    }
    expect(erred).toBe(true);
  });

  test('Returns empty newCreds if setError is undefined', async () => {
    // Setup test
    const { result, waitForNextUpdate } = renderHook(() => useRetrieveNewCredentials({ 
      setError: undefined,
      retrievalEndpoint: '123',
    }));
    // Assert. Expect no update.
    expect(result.current.newCreds).toBe(undefined);
    let erred = false;
    try {
      await waitForNextUpdate({ timeout: 500 });
    } catch (err) {
      if (err?.message?.includes('Timed out in waitForNextUpdate after 500ms')) {
        erred = true;
      }
    }
    expect(erred).toBe(true);
  });

  test('Returns empty newCreds if both retrievalEndpoint and setError are undefined', async () => {
    // Setup test
    const { result, waitForNextUpdate } = renderHook(() => useRetrieveNewCredentials({ 
      setError: undefined,
      retrievalEndpoint: undefined,
    }));
    // Assert. Expect no update.
    expect(result.current.newCreds).toBe(undefined);
    let erred = false;
    try {
      await waitForNextUpdate({ timeout: 500 });
    } catch (err) {
      if (err?.message?.includes('Timed out in waitForNextUpdate after 500ms')) {
        erred = true;
      }
    }
    expect(erred).toBe(true);
  });
});

describe('useAddNewSecret', () => {
  
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('Returns newCredsWithNewSecret, a valid transformation of inputted newCreds, if valid params are provided and if sessionStorage is empty prior to render', async () => {
    // Setup test
    sessionStorage.clear();
    const { result, waitForNextUpdate } = renderHook(() => useAddNewSecret({ 
      retrievalEndpoint: '123',
      newCreds: validCredsFromMockIdServerIssuer,
    }));
    await waitForNextUpdate();

    // Assert
    const newCredsWithNewSecret = result.current.newCredsWithNewSecret;
    expect(newCredsWithNewSecret.creds.newSecret).toBeDefined();
    expect(newCredsWithNewSecret.creds.serializedAsNewPreimage).toBeDefined();
    expect(newCredsWithNewSecret.newLeaf).toBeDefined();
    expect(newCredsWithNewSecret.creds.serializedAsNewPreimage[1])
      .toEqual(newCredsWithNewSecret.creds.newSecret);
    expect(newCredsWithNewSecret.newLeaf)
      .toEqual(poseidon(newCredsWithNewSecret.creds.serializedAsNewPreimage).toString());

    // Expect new preimage to be the same as the old preimage, except for the new secret
    for (let i = 0; i < 6; i++) {
      if (i === 1) continue;
      expect(newCredsWithNewSecret.creds.serializedAsNewPreimage[i])
        .toEqual(validCredsFromMockIdServerIssuer.creds.serializedAsPreimage[i]);
    }
    
    // Expect newCredsWithNewSecret to be the same as validCredsFromMockIdServerIssuer in all other respects
    const returnedCredsWithoutNewSecret = { ...newCredsWithNewSecret };
    returnedCredsWithoutNewSecret.creds.newSecret = undefined;
    returnedCredsWithoutNewSecret.creds.serializedAsNewPreimage = undefined;
    returnedCredsWithoutNewSecret.newLeaf = undefined;
    expect(returnedCredsWithoutNewSecret).toEqual(validCredsFromMockIdServerIssuer);
  });

  test('Returns the same newCredsWithNewSecret across re-renders during same browser session if valid params are provided', async () => {
    // Setup test
    const { result, waitForNextUpdate, rerender } = renderHook(() => useAddNewSecret({ 
      retrievalEndpoint: '123',
      newCreds: validCredsFromMockIdServerIssuer,
    }));
    await waitForNextUpdate();
    const newCredsWithNewSecret1 = result.current.newCredsWithNewSecret;
    rerender({
      retrievalEndpoint: '123',
      newCreds: validCredsFromMockIdServerIssuer,
    });
    const newCredsWithNewSecret2 = result.current.newCredsWithNewSecret;
    // Assert
    expect(newCredsWithNewSecret1).toEqual(newCredsWithNewSecret2);
  });

  test('Returns empty newCredsWithNewSecret if newCreds is undefined', async () => {
    // Setup test
    const { result, waitForNextUpdate } = renderHook(() => useAddNewSecret({ 
      retrievalEndpoint: '123',
      newCreds: undefined,
    }));
    // Assert. Expect no update.
    expect(result.current.newCredsWithNewSecret).toBe(undefined);
    let erred = false;
    try {
      await waitForNextUpdate({ timeout: 500 });
    } catch (err) {
      if (err?.message?.includes('Timed out in waitForNextUpdate after 500ms')) {
        erred = true;
      }
    }
    expect(erred).toBe(true);
  });

  test('Returns empty newCredsWithNewSecret if retrievalEndpoint is undefined', async () => {
    // Setup test
    const { result, waitForNextUpdate } = renderHook(() => useAddNewSecret({ 
      retrievalEndpoint: undefined,
      newCreds: validCredsFromMockIdServerIssuer,
    }));
    // Assert. Expect no update.
    expect(result.current.newCredsWithNewSecret).toBe(undefined);
    let erred = false;
    try {
      await waitForNextUpdate({ timeout: 500 });
    } catch (err) {
      if (err?.message?.includes('Timed out in waitForNextUpdate after 500ms')) {
        erred = true;
      }
    }
    expect(erred).toBe(true);
  });
});


describe('useMergeCreds', () => {
  
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('Returns confirmationStatus of "confirmed", undefined credsThatWillBeOverwritten, and mergedSortedCreds (newCreds merged into sortedCreds) and sets no error if given sortedCreds of {}, loadingCreds of false, and valid newCreds', async () => {
    // Setup test
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const sortedCreds = {};
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      sortedCreds,
      loadingCreds,
      newCreds: validCredsFromMockIdServerIssuer,
    }));
    
    // Assert
    expect(result.current.confirmationStatus).toBe('confirmed');
    expect(result.current.credsThatWillBeOverwritten).toBe(undefined);
    expect(result.current.mergedSortedCreds).toEqual({
      [validCredsFromMockIdServerIssuer.creds.issuerAddress]: validCredsFromMockIdServerIssuer,
    });
    expect(error).toBe(undefined);
  });

  test('Returns confirmationStatus of "confirmed", undefined credsThatWillBeOverwritten, and mergedSortedCreds (newCreds merged into sortedCreds) and sets no error if given sortedCreds that include creds from issuer of newCreds and newCreds is same as already stored creds', async () => {
    // Setup test
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const sortedCreds = {
      [validCredsFromMockIdServerIssuer.creds.issuerAddress]: validCredsFromMockIdServerIssuer,
    };
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      sortedCreds,
      loadingCreds,
      newCreds: validCredsFromMockIdServerIssuer,
    }));

    // Assert
    expect(result.current.confirmationStatus).toBe('confirmed');
    expect(result.current.credsThatWillBeOverwritten).toBe(undefined);
    expect(result.current.mergedSortedCreds).toEqual(sortedCreds);
    expect(error).toBe(undefined);
  });

  test('Returns confirmationStatus of "confirmationRequired", correctly populated credsThatWillBeOverwritten, and undefined mergedSortedCreds and sets no error if given sortedCreds that include creds from issuer of newCreds but newCreds is different than already stored creds', async () => {
    // Setup test
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const oldCreds = {
      ...validCredsFromMockIdServerIssuer,
      creds: {
        ...validCredsFromMockIdServerIssuer.creds,
        iat: "0x123",
      },
    };
    const sortedCreds = {
      [validCredsFromMockIdServerIssuer.creds.issuerAddress]: oldCreds,
    };
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      sortedCreds,
      loadingCreds,
      newCreds: validCredsFromMockIdServerIssuer,
    }));
    
    // Assert
    expect(result.current.confirmationStatus).toBe('confirmationRequired');
    expect(result.current.credsThatWillBeOverwritten).toEqual(oldCreds);
    expect(result.current.mergedSortedCreds).toBe(undefined);
    expect(error).toBe(undefined);
  });

  test('Merges newCreds into sortedCreds and returns confirmationStatus of "confirmed", populated credsThatWillBeOverwritten, and mergedSortedCreds and sets no error if given sortedCreds that include creds from issuer of newCreds but newCreds is different than already stored creds and user confirms overwrite', async () => {
    // Setup test
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const oldCreds = {
      ...validCredsFromMockIdServerIssuer,
      creds: {
        ...validCredsFromMockIdServerIssuer.creds,
        iat: "0x123",
      },
    };
    const sortedCreds = {
      [validCredsFromMockIdServerIssuer.creds.issuerAddress]: oldCreds,
    };
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      sortedCreds,
      loadingCreds,
      newCreds: validCredsFromMockIdServerIssuer,
    }));
    
    // Assert initial state
    expect(result.current.confirmationStatus).toBe('confirmationRequired');
    expect(result.current.credsThatWillBeOverwritten).toBe(oldCreds);
    expect(result.current.mergedSortedCreds).toBe(undefined);

    // Act
    act(() => {
      result.current.onConfirmOverwrite();
    });

    // Assert final state
    expect(result.current.confirmationStatus).toBe('confirmed');
    expect(result.current.mergedSortedCreds).toEqual({
      [validCredsFromMockIdServerIssuer.creds.issuerAddress]: validCredsFromMockIdServerIssuer,
    });
    expect(error).toBe(undefined);
  });

  test('Returns confirmationStatus of "denied", correctly populated credsThatWillBeOverwritten, and undefined mergedSortedCreds and sets no error if given sortedCreds that include creds from issuer of newCreds but newCreds is different than already stored creds and user cancels overwrite', async () => {
    // Setup test
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const oldCreds = {
      ...validCredsFromMockIdServerIssuer,
      creds: {
        ...validCredsFromMockIdServerIssuer.creds,
        iat: "0x123",
      },
    };
    const sortedCreds = {
      [validCredsFromMockIdServerIssuer.creds.issuerAddress]: oldCreds,
    };
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      sortedCreds,
      loadingCreds,
      newCreds: validCredsFromMockIdServerIssuer,
    }));
    
    // Assert initial state
    expect(result.current.confirmationStatus).toBe('confirmationRequired');
    expect(result.current.credsThatWillBeOverwritten).toBe(oldCreds);
    expect(result.current.mergedSortedCreds).toBe(undefined);

    // Act
    act(() => {
      result.current.onDenyOverwrite();
    });

    // Assert final state
    expect(result.current.confirmationStatus).toBe('denied');
    expect(result.current.mergedSortedCreds).toBe(undefined);
    expect(error).toBe(undefined);
  });

  test('Sets error and returns confirmationStatus of "init", undefined credsThatWillBeOverwritten, and undefined mergedSortedCreds if issuer in newCreds is not whitelisted', async () => {
    // Setup test
    const issuerAddress = '0xNOTWHITELISTED';
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const newCreds = {
      ...validCredsFromMockIdServerIssuer,
      creds: {
        ...validCredsFromMockIdServerIssuer.creds,
        issuerAddress: issuerAddress,
      },
    };
    const sortedCreds = {};
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      sortedCreds,
      loadingCreds,
      newCreds,
    }));

    // Assert
    expect(result.current.confirmationStatus).toBe('init');
    expect(result.current.mergedSortedCreds).toBe(undefined);
    expect(error).toBe(`Issuer ${issuerAddress} is not whitelisted.`);
  });

  test('Returns confirmationStatus of "init", undefined credsThatWillBeOverwritten, and undefined mergedSortedCreds if setError is undefined', async () => {
    // Setup test
    const sortedCreds = {};
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      sortedCreds,
      loadingCreds,
      newCreds: validCredsFromMockIdServerIssuer,
    }));

    // Assert
    expect(result.current.confirmationStatus).toBe('init');
    expect(result.current.credsThatWillBeOverwritten).toBe(undefined);
    expect(result.current.mergedSortedCreds).toBe(undefined);
  });

  test('Returns confirmationStatus of "init", undefined credsThatWillBeOverwritten, and undefined mergedSortedCreds and sets no error if sortedCreds is undefined', async () => {
    // Setup test
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      loadingCreds,
      newCreds: validCredsFromMockIdServerIssuer,
    }));

    // Assert
    expect(result.current.confirmationStatus).toBe('init');
    expect(result.current.credsThatWillBeOverwritten).toBe(undefined);
    expect(result.current.mergedSortedCreds).toBe(undefined);
    expect(error).toBe(undefined);
  });

  test('Returns confirmationStatus of "init", undefined credsThatWillBeOverwritten, and undefined mergedSortedCreds and sets no error if loadingCreds is true', async () => {
    // Setup test
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const sortedCreds = {};
    const loadingCreds = true;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      sortedCreds,
      loadingCreds,
      newCreds: validCredsFromMockIdServerIssuer,
    }));

    // Assert
    expect(result.current.confirmationStatus).toBe('init');
    expect(result.current.credsThatWillBeOverwritten).toBe(undefined);
    expect(result.current.mergedSortedCreds).toBe(undefined);
    expect(error).toBe(undefined);
  });

  test('Returns confirmationStatus of "init", undefined credsThatWillBeOverwritten, and undefined mergedSortedCreds and sets no error if newCreds is undefined', async () => {
    // Setup test
    let error = undefined;
    const setError = (err) => {
      error = err;
    };
    const sortedCreds = {};
    const loadingCreds = false;
    const { result } = renderHook(() => useMergeCreds({
      setError,
      sortedCreds,
      loadingCreds,
    }));

    // Assert
    expect(result.current.confirmationStatus).toBe('init');
    expect(result.current.credsThatWillBeOverwritten).toBe(undefined);
    expect(result.current.mergedSortedCreds).toBe(undefined);
    expect(error).toBe(undefined);
  });

});

describe('useStoreCredentialsState', () => {
  test('Calls setCredsForAddLeaf with new credentials, without updating confirmation-related variables, if all dependency hooks and APIs return expected values', async () => {
    // jest.spyOn(global, 'fetch').mockImplementation(() => {
    //   return Promise.resolve({
    //     status: 200,
    //     json: async () => Promise.resolve(validCredsFromMockIdServerIssuer),
    //     text: () => Promise.resolve(''),
    //   });
    // });

    // const searchParams = new URLSearchParams({ retrievalEndpoint: 'MTIz' });
    // let setCredsForAddLeafCalled = false;
    // const setCredsForAddLeaf = (creds) => {
    //   setCredsForAddLeafCalled = true;
    // };
    // const { result, waitForNextUpdate } = renderHook(() => useStoreCredentialsState({ 
    //   searchParams,
    //   setCredsForAddLeaf
    // }));

    // // assert initial state
    // expect(result.current.credsThatWillBeOverwritten).toBe(undefined);
    // expect(result.current.declinedToStoreCreds).toBe(false);
    // expect(result.current.confirmationModalVisible).toBe(false);
    // expect(result.current.error).toBe(undefined);
    // expect(result.current.status).toBe('loading');

    // await waitForNextUpdate();

    // // assert new state
    // expect(setCredsForAddLeafCalled).toBe(true);
    // expect(result.current.credsThatWillBeOverwritten).toBe(undefined);
    // expect(result.current.declinedToStoreCreds).toBe(false);
    // expect(result.current.confirmationModalVisible).toBe(false);
    // expect(result.current.error).toBe(undefined);
    // expect(result.current.status).toBe('success');

    // // add second value
    // act(() => {
    //   result.current.set('two')
    // })

    // assert new state
    // expect(setCredsForAddLeafCalled).toBe(true);
    // expect(status).toBe('success');

    // // add third value
    // act(() => {
    //   result.current.set('three')
    // })

    // // assert new state
    // expect(result.current.canUndo).toBe(true)
    // expect(result.current.canRedo).toBe(false)
    // expect(result.current.past).toEqual(['one', 'two'])
    // expect(result.current.present).toEqual('three')
    // expect(result.current.future).toEqual([])

    // // undo
    // act(() => {
    //   result.current.undo()
    // })

    // // assert "undone" state
    // expect(result.current.canUndo).toBe(true)
    // expect(result.current.canRedo).toBe(true)
    // expect(result.current.past).toEqual(['one'])
    // expect(result.current.present).toEqual('two')
    // expect(result.current.future).toEqual(['three'])

    // // undo again
    // act(() => {
    //   result.current.undo()
    // })

    // // assert "double-undone" state
    // expect(result.current.canUndo).toBe(false)
    // expect(result.current.canRedo).toBe(true)
    // expect(result.current.past).toEqual([])
    // expect(result.current.present).toEqual('one')
    // expect(result.current.future).toEqual(['two', 'three'])

    // // redo
    // act(() => {
    //   result.current.redo()
    // })

    // // assert undo + undo + redo state
    // expect(result.current.canUndo).toBe(true)
    // expect(result.current.canRedo).toBe(true)
    // expect(result.current.past).toEqual(['one'])
    // expect(result.current.present).toEqual('two')
    // expect(result.current.future).toEqual(['three'])

    // // add fourth value
    // act(() => {
    //   result.current.set('four')
    // })

    // // assert final state (note the lack of "third")
    // expect(result.current.canUndo).toBe(true)
    // expect(result.current.canRedo).toBe(false)
    // expect(result.current.past).toEqual(['one', 'two'])
    // expect(result.current.present).toEqual('four')
    // expect(result.current.future).toEqual([])
  })
})