import { useCallback } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { hashTypedData } from 'viem'
import { toast } from 'sonner'
import { useSigningStore } from '../../stores/signingStore'
import { EIP712Message } from '../../utils/eip712'
import { verifyECDSASignature } from './eoaVerification'
import { SigningHook } from '../common/types'

/**
 * EOA (Externally Owned Account) signing hook
 *
 * Handles EIP712 signing for regular wallets (MetaMask, etc.)
 * - Signing is synchronous - signature available immediately after user approval
 * - Verification uses ECDSA signature recovery
 * - No polling or multisig coordination needed
 */
export const useEOASigning = (): SigningHook => {
  const { address, chainId } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()
  const {
    messageHash,
    signature,
    signingInProgress,
    setSigningInProgress,
    setMessageHash,
    setSignature,
  } = useSigningStore()

  /**
   * Sign an EIP712 message with EOA wallet
   * Signature is stored immediately after user approval
   */
  const signMessage = useCallback(
    async (message: EIP712Message) => {
      if (!address || !chainId) {
        toast.error('Wallet not connected')
        return
      }

      try {
        setSigningInProgress(true)

        // Hash the message for storage and verification
        const hash = hashTypedData(message)
        setMessageHash(hash)

        // Request signature from wallet
        const sig = await signTypedDataAsync({
          domain: message.domain,
          types: message.types,
          primaryType: message.primaryType,
          message: message.message,
        })

        // Store signature immediately (EOA signing is synchronous)
        setSignature(sig)
        toast.success('✅ EOA message signed successfully!')
      } catch (error) {
        if ((error as Error).message.includes('User rejected')) {
          toast.error('Signing cancelled by user')
        } else {
          toast.error('Error signing message')
          console.error('EOA signing error:', error)
        }
        setSigningInProgress(false)
      }
    },
    [address, chainId, signTypedDataAsync, setSigningInProgress, setMessageHash, setSignature]
  )

  /**
   * Verify the EOA signature using ECDSA recovery
   */
  const verifySignature = useCallback(async () => {
    if (!messageHash || !signature || !address) {
      toast.error('No signature to verify')
      return
    }

    await verifyECDSASignature(messageHash, signature, address)
  }, [messageHash, signature, address])

  return {
    signMessage,
    verifySignature,
    signature,
    messageHash,
    signingInProgress,
  }
}
