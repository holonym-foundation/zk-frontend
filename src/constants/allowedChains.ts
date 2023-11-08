import { mainnet, optimism, optimismGoerli, fantom, avalanche } from '@wagmi/core/chains'

export const allowedChains = [
  mainnet, // Ethereum Mainnet
  process?.env?.NODE_ENV === 'development' 
    ? optimismGoerli
    : optimism, 
  fantom,
  avalanche,
]
