import { optimism, optimismGoerli, fantom } from '@wagmi/core/chains'

export const allowedChains = [
  process?.env?.NODE_ENV === 'development' 
    ? optimismGoerli // Optimism Goerli
    : optimism, // Optimism
  fantom, // Fantom
]
