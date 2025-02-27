
export async function addOptimism() {
  try {
    // @ts-ignore
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0xa",
          chainName: "Optimism",
          nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://mainnet.optimism.io"],
          blockExplorerUrls: ["https://optimistic.etherscan.io"],
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
}

export async function addFantom() {
  try {
    // @ts-ignore
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0xfa",
          chainName: "Fantom",
          nativeCurrency: {
            symbol: "FTM",
          },
          rpcUrls: ["https://rpc.ankr.com/fantom/"],
          blockExplorerUrls: ["https://ftmscan.com/"],
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
}

export async function addAvalanche() {
  try {
    // @ts-ignore
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0xa86a",
          chainName: "Avalanche Mainnet C-Chain",
          nativeCurrency: {
            symbol: "AVAX",
          },
          rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
          blockExplorerUrls: ["https://snowtrace.io/"],
        },
      ],
    });
  } catch (err) {
    console.error(err);
  }
}
