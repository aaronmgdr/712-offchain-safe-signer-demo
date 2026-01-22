import { publicClient } from '../config/viemClient'

/**
 * Detect if a wallet is a SAFE smart account
 * Simply checks if address is a contract (SAFE is a smart contract)
 */
export const detectSafeWallet = async (address: string): Promise<boolean> => {
  try {
    // Check if address has code (is a contract)
    const code = await publicClient.getCode({ address: address as `0x${string}` })
    
    // If it has code, it's likely a SAFE or other smart contract
    // Further verification can be done via ERC-1271 isValidSignature call
    return Boolean(code && code !== '0x')
  } catch (error) {
    console.error('Error detecting SAFE wallet:', error)
    return false
  }
}

const chainIdMap: Record<number, string> = {
  42220: 'celo',
}

/**
 * Poll SAFE Transaction Service for signature completion
 */
export const pollSafeSigningStatus = async (
  safeAddress: string,
  txHash: string,
  chainId: number,
  maxAttempts: number = 60, // 5 minutes at 5 second intervals
  interval: number = 5000
): Promise<{
  isComplete: boolean
  confirmations: number
  threshold: number
  error?: string
}> => {
 
  
  const chainName = chainIdMap[chainId]
  if (!chainName) {
    return { isComplete: false, confirmations: 0, threshold: 0, error: 'Unsupported chain' }
  }
  
  const serviceUrl = `https://safe-transaction-${chainName}.safe.global/api/v1`
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${serviceUrl}/safes/${safeAddress}/multisig-transactions/${txHash}/`
      )
      
      if (!response.ok) {
        // Transaction might not exist yet
        await new Promise(resolve => setTimeout(resolve, interval))
        continue
      }
      
      const tx = await response.json()
      const confirmations = tx.confirmations?.length || 0
      const threshold = tx.confirmationsRequired || 0
      
      if (tx.isExecuted) {
        return {
          isComplete: true,
          confirmations,
          threshold,
        }
      }
      
      // Return progress update
      return {
        isComplete: false,
        confirmations,
        threshold,
      }
    } catch (error) {
      console.error('Error polling SAFE status:', error)
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }
  
  return {
    isComplete: false,
    confirmations: 0,
    threshold: 0,
    error: 'Polling timeout',
  }
}

/**
 * Construct SAFE transaction service URL
 */
export const getSafeServiceUrl = (chainId: number): string => {
  
  const chainName = chainIdMap[chainId] || 'celo'
  return `https://safe-transaction-${chainName}.safe.global`
}
