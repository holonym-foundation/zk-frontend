export const desiredChainId = 
  process?.env?.NODE_ENV === 'development' 
      ? 420 // Optimism Goerli
      : 10 // Optimism
// export const desiredChainId = 420 // Optimism Goerli
