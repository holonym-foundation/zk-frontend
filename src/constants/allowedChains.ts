import { mainnet, optimism, optimismGoerli, fantom } from '@wagmi/core/chains'

export const allowedChains = [
  mainnet, // Ethereum Mainnet
  process?.env?.NODE_ENV === 'development' 
    ? optimismGoerli // Optimism Goerli
    : optimism, // Optimism
  fantom, // Fantom
]
