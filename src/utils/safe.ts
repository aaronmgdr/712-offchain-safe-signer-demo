import { Hash } from 'viem'
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
  safeMessageHash: Hash,
  chainId: number,
  threshold: number,
): Promise<{
  signature?: Hash
  isComplete: boolean
  confirmations: number
  threshold: number
  error?: string
}> => {
 
  
  const chainName = chainIdMap[chainId]
  if (!chainName) {
    return { isComplete: false, confirmations: 0, threshold: 0, error: 'Unsupported chain' }
  }
 // OR  https://api.safe.global/tx-service/celo/api/v1/safes/${safeAddress}/messages
  const serviceUrl = `https://api.safe.global/tx-service/${chainName}/api/v1`
                    //https://api.safe.global/tx-service/celo/api/v1/messages/0x3b3b57b3/
  

  try {
    const response = await fetch(
      `${serviceUrl}/messages/${safeMessageHash}/`,
      { headers: {
          'Content-Type': 'application/json',
          "Accept": "application/json",
          // @ts-expect-error: Ignore missing env var error
          'Authorization': `Bearer ${import.meta.env.VITE_SAFE_API_KEY || ''}`,
        },
      }
    )
    
    if (!response.ok) {
      return { isComplete: false, confirmations: 0, threshold: 0, error: response.statusText }
    }
    
    const tx = await response.json()
    const confirmations = tx.confirmations?.length || 0
    
    if (confirmations > 0 && confirmations === threshold && tx.preparedSignature) {
      return {
        isComplete: true,
        confirmations,
        signature: tx.preparedSignature,
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
    return {
      isComplete: false,
      confirmations: 0,
      threshold,
    }
  }  
}

/**
 * Construct SAFE transaction service URL
 */
export const getSafeServiceUrl = (chainId: number): string => {
  
  const chainName = chainIdMap[chainId] || 'celo'
  return `https://safe-transaction-${chainName}.safe.global`
}
