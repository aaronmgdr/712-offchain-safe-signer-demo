import { recoverAddress } from 'viem'
import { toast } from 'sonner'

/**
 * EOA (Externally Owned Account) signature verification using ECDSA
 *
 * Verifies a signature by recovering the signer's address from the message hash
 * and signature, then comparing it to the expected address.
 */

/**
 * Verify standard ECDSA signature for EOA wallets
 *
 * @param messageHash - The EIP712 message hash that was signed
 * @param signature - The signature to verify
 * @param expectedAddress - The address that should have signed the message
 * @returns true if the signature is valid, false otherwise
 */
export const verifyECDSASignature = async (
  messageHash: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> => {
  try {
    // Recover the address that created this signature
    const recoveredAddress = await recoverAddress({
      hash: messageHash as `0x${string}`,
      signature: signature as `0x${string}`,
    })

    // Compare recovered address with expected address (case-insensitive)
    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()

    if (isValid) {
      toast.success('✓ EOA signature verified successfully!')
    } else {
      toast.error('✗ EOA signature verification failed - address mismatch')
    }

    return isValid
  } catch (error) {
    console.error('Error verifying ECDSA signature:', error)
    toast.error('✗ Error verifying EOA signature')
    return false
  }
}
