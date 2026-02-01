import { getContract } from 'viem'
import { publicClient } from '../../config/viemClient'
import { toast } from 'sonner'

/**
 * Safe multisig signature verification using ERC-1271 standard
 *
 * ERC-1271 allows smart contracts to verify signatures by implementing
 * the isValidSignature() function. Safe contracts use this to validate
 * multisig signatures.
 */

// Safe ERC-1271 contract ABI
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
 * Verify ERC-1271 signature for Safe contract accounts
 *
 * @param safeAddress - The Safe contract address
 * @param messageHash - The message hash to verify
 * @param signature - The multisig signature to verify
 * @returns true if the signature is valid according to ERC-1271, false otherwise
 */
export const verifyERC1271Signature = async (
  safeAddress: string,
  messageHash: string,
  signature: string
): Promise<boolean> => {
  try {
    // Get Safe contract instance
    const safeContract = getContract({
      address: safeAddress as `0x${string}`,
      abi: SAFE_ERC1271_ABI,
      client: { public: publicClient },
    })

    // Call isValidSignature on Safe contract
    const result = await safeContract.read.isValidSignature(
      [messageHash as `0x${string}`, signature as `0x${string}`],
      { account: safeAddress as `0x${string}` }
    )

    // ERC-1271 magic values for valid signatures:
    // 0x1626ba7e - newer standard: isValidSignature(bytes32,bytes)
    // 0x20c13b0b - current standard: isValidSignature(bytes,bytes)
    // see https://github.com/ethereum/ERCs/commit/92a81d542e54e6ec907dff81dc5ef8600b86030e
    const isValid = result === '0x1626ba7e' || result === '0x20c13b0b'

    if (isValid) {
      toast.success('✓ Safe multisig signature verified via ERC-1271!')
    } else {
      toast.error('✗ Safe signature verification failed')
    }

    return isValid
  } catch (error) {
    console.error('Error verifying ERC-1271 signature:', error)
    toast.error('✗ Error verifying Safe signature')
    return false
  }
}
