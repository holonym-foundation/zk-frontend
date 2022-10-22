import React, { useEffect, useState } from "react";
import { QueryClient } from "react-query";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { act } from "react-dom/test-utils";
import { MockConnector } from "@wagmi/core/connectors/mock";

import { ethers, providers } from "ethers";
import { Wallet } from "ethers/lib/ethers";
// import { getSigners } from "../../core/test/utils";
import { Provider, createClient, ClientConfig, Connector } from "wagmi";

import Address from "../../components/atoms/Address";
import { useSigner, useAccount, useConnect, useProvider } from "wagmi";
import { connect } from "@wagmi/core";

const chainHardhat = {
  id: 31337,
  name: "Hardhat",
  rpcUrls: {
    default: "http://127.0.0.1:8545",
  },
};

const allChains = [
  // {
  //   id: 1,
  //   name: 'Ethereum',
  //   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  //   rpcUrls: {
  //     alchemy: alchemyRpcUrls.mainnet,
  //     infura: infuraRpcUrls.mainnet,
  //     default: `${alchemyRpcUrls.mainnet}/${defaultAlchemyId}`,
  //   },
  //   blockExplorers: {
  //     etherscan: etherscanBlockExplorers.mainnet,
  //     default: etherscanBlockExplorers.mainnet,
  //   },
  // },
  {
    id: 1337,
    name: "Localhost",
    rpcUrls: {
      default: "http://127.0.0.1:8545",
    },
  },
  chainHardhat,
];

const accounts = [
  {
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    balance: "10000000000000000000000",
  },
  {
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    balance: "10000000000000000000000",
  },
];

function getNetwork(chain) {
  return {
    chainId: chain.id,
    ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    name: chain.name,
  };
}

class EthersProviderWrapper extends providers.StaticJsonRpcProvider {
  toJSON() {
    return `<Provider network={${this.network.chainId}} />`;
  }
}

// function getProvider({ chainId }) {
function getProvider() {
  // const chain = allChains.find((x) => x.id === chainId) ?? chainHardhat;
  const chain = chainHardhat;
  const network = getNetwork(chain);
  const url = chainHardhat.rpcUrls.default.toString();
  const provider = new EthersProviderWrapper(url, network);
  provider.pollingInterval = 1_000;
  return provider;
}

function getSigners() {
  const provider = getProvider();
  const signers = accounts.map((x) => {
    const wallet = new Wallet(x.privateKey);
    return provider.getSigner(wallet.address);
  });
  return signers;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent Jest from garbage collecting cache
      cacheTime: Infinity,
      // Turn off retries to prevent timeouts
      retry: false,
    },
  },
  logger: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    error: () => {},
    log: console.log,
    warn: console.warn,
  },
});

function setupWagmiClient(config) {
  return createClient({
    connectors: [
      new MockConnector({
        options: {
          signer: getSigners()[0],
        },
      }),
    ],
    provider: getProvider,
    ...config,
  });
}

// const client = setupWagmiClient({ queryClient });

const client = createClient({
  connectors: [
    new MockConnector({
      options: {
        signer: getSigners()[0],
      },
    }),
  ],
  provider: getProvider,
});

// ---------------------------------------------------------------------------------------------------------
const Element = (props) => {
  // const { activeConnector, connect, connectors, error, isConnecting, pendingConnector } = useConnect();
  // const { data: account, refetch } = useAccount();
  const acc = useAccount();
  const provider = useProvider();
  // const { data: signer, isError, isLoading } = useSigner();

  const [address, setAddress] = useState();

  useEffect(() => {
    setAddress("0x000...");
    // provider.getAccount().then((addr) => setAddress(addr));
    console.log(Object.keys(acc));
    console.log(typeof acc.connection);
    setAddress(typeof acc);

    // connect(client.connectors[0]);
    // signer.getAddress().then((addr) => setAddress(addr));
  }, []);

  return (
    <div>
      <p>Paragraph</p>
      <p>{address}</p>
      <p></p>
      {/* <p>{signer}</p> */}
      {/* <p>{account.address}</p> */}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------
// TODO: Return to this once the question has been answered: https://github.com/tmm/wagmi/discussions/424
it("renders", async () => {
  // const testMsg = "Please work";
  act(() => {
    render(
      <Provider client={client}>
        <div>{/* <Element /> */}</div>
        {/* <Address /> */}
      </Provider>
    );
  });
  // const client = setupWagmiClient();
  // await connect({ connector: client.connectors[0] });

  // const { result, waitFor } = renderHook(() => useAccount(), {
  //   wrapper,
  //   initialProps: { client },
  // });

  // await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

  // const name = screen.getByText("0x000...");
  // expect(name).toBeInTheDocument();
});
