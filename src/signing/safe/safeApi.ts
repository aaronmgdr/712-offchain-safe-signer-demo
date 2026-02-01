import Safe from '@safe-global/protocol-kit'
import { Address, Chain, Hash } from 'viem'

/**
 * Safe Transaction Service API utilities
 *
 * This module handles interactions with the Safe Transaction Service API
 * for polling multisig signature status and computing Safe-specific hashes.
 */

/** Mapping of chain IDs to Safe Transaction Service chain names */
const chainIdMap: Record<number, string> = {
  42220: 'celo',
}

/**
 * Get Safe-specific message hash and multisig threshold
 *
 * Initializes the Safe SDK and computes the Safe-wrapped message hash
 * and retrieves the signature threshold for the multisig.
 *
 * @param messageHash - The standard EIP712 message hash
 * @param safeAddress - The Safe contract address
 * @param chain - The chain the Safe is deployed on
 * @returns Safe message hash and threshold
 */
export async function getSafeMessageHashAndThreshold(
  messageHash: Hash,
  safeAddress: Address,
  chain: Chain
) {
  // Initialize Safe SDK
  const safe = await Safe.init({
    provider: chain.rpcUrls.default.http[0],
    safeAddress: safeAddress,
  })

  // Compute Safe message hash and get threshold in parallel
  const [safeMessageHash, threshold] = await Promise.all([
    safe.getSafeMessageHash(messageHash),
    safe.getThreshold(),
  ])

  return { safeMessageHash: safeMessageHash as Hash, threshold }
}

/**
 * Poll Safe Transaction Service for signature completion
 *
 * Queries the Safe Transaction Service API to check if enough multisig
 * signatures have been collected to meet the threshold.
 *
 * @param safeMessageHash - The Safe-wrapped message hash
 * @param chainId - The chain ID
 * @param threshold - Required number of signatures
 * @returns Signature status including whether complete and current confirmations
 */
export const pollSafeSigningStatus = async (
  safeMessageHash: Hash,
  chainId: number,
  threshold: number
): Promise<{
  signature?: Hash
  isComplete: boolean
  confirmations: number
  threshold: number
  error?: string
}> => {
  const chainName = chainIdMap[chainId]
  if (!chainName) {
    return {
      isComplete: false,
      confirmations: 0,
      threshold: 0,
      error: 'Unsupported chain',
    }
  }

  const serviceUrl = `https://api.safe.global/tx-service/${chainName}/api/v1`

  try {
    const response = await fetch(`${serviceUrl}/messages/${safeMessageHash}/`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // @ts-expect-error: Ignore missing env var error
        Authorization: `Bearer ${import.meta.env.VITE_SAFE_API_KEY || ''}`,
      },
    })

    if (!response.ok) {
      return {
        isComplete: false,
        confirmations: 0,
        threshold: 0,
        error: response.statusText,
      }
    }

    const tx = await response.json()
    const confirmations = tx.confirmations?.length || 0

    // Check if all required signatures are collected
    if (
      confirmations > 0 &&
      confirmations === threshold &&
      tx.preparedSignature
    ) {
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
    console.error('Error polling Safe status:', error)
    return {
      isComplete: false,
      confirmations: 0,
      threshold,
    }
  }
}
