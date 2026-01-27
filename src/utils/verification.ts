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
    console.info('Verifying ERC-1271 signature with params:', { messageHash, signature, safeAddress })
    // Call isValidSignature on SAFE
    const result = await safeContract.read.isValidSignature(
      [messageHash as `0x${string}`, signature as `0x${string}`],
      { account: safeAddress as `0x${string}` }
    )
    console.info('ERC-1271 verification result:', result)
    // ERC-1271 magic values for valid signatures:
    // 0x1626ba7e - newer standard: isValidSignature(bytes32,bytes)
    // 0x20c13b0b - current standard: isValidSignature(bytes,bytes)
    // see https://github.com/ethereum/ERCs/commit/92a81d542e54e6ec907dff81dc5ef8600b86030e
    return result === '0x1626ba7e' || result === '0x20c13b0b'
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
