import { recoverAddress, getContract } from 'viem'
import { publicClient } from '../config/viemClient'

// SAFE ERC1271 contract ABI
const SAFE_ERC1271_ABI = [
  {
    inputs: [
      { name: '_data', type: 'bytes' },
      { name: '_signature', type: 'bytes' },
    ],
    name: 'isValidSignature',
    outputs: [{ name: '', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Verify ERC-1271 signature for SAFE contract accounts using Protocol Kit
 */
export const verifyERC1271Signature = async (
  safeAddress: string,
  messageHash: string,
  signature: string
): Promise<boolean> => {
  try {
    // Get SAFE contract instance
    const safeContract = getContract({
      address: safeAddress as `0x${string}`,
      abi: SAFE_ERC1271_ABI,
      client: { public: publicClient },
    })

    // Call isValidSignature on SAFE
    const result = await safeContract.read.isValidSignature(
      [messageHash as `0x${string}`, signature as `0x${string}`],
      { account: safeAddress as `0x${string}` }
    )

    // ERC-1271 returns 0x1626ba7e for valid signatures
    return result === '0x1626ba7e'
  } catch (error) {
    console.error('Error verifying ERC-1271 signature:', error)
    return false
  }
}

/**
 * Verify standard ECDSA signature (EOA)
 */
export const verifyECDSASignature = async (
  messageHash: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> => {
  try {
    const recoveredAddress = await recoverAddress({
      hash: messageHash as `0x${string}`,
      signature: signature as `0x${string}`,
    })
    
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  } catch (error) {
    console.error('Error verifying ECDSA signature:', error)
    return false
  }
}

/**
 * Verify signature based on account type
 */
export const verifySignature = async (
  messageHash: string,
  signature: string,
  account: string,
  isSafe: boolean
): Promise<boolean> => {
  if (isSafe) {
    return verifyERC1271Signature(account, messageHash, signature)
  } else {
    return verifyECDSASignature(messageHash, signature, account)
  }
}
