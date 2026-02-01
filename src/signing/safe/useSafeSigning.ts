import { useCallback, useEffect } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { hashTypedData, Address } from 'viem'
import { toast } from 'sonner'
import { useSigningStore } from '../../stores/signingStore'
import { useSafeStore } from '../../stores/safeStore'
import { EIP712Message } from '../../utils/eip712'
import { getSafeMessageHashAndThreshold } from './safeApi'
import { verifyERC1271Signature } from './safeVerification'
import { SigningHook } from '../common/types'

/**
 * Safe multisig signing hook
 *
 * Handles EIP712 signing for Safe multisig wallets
 * - Signing is asynchronous - requires polling the Safe Transaction Service
 * - Uses Safe SDK to compute Safe-specific message hashes
 * - Tracks threshold (signatures needed) and confirmations (signatures collected)
 * - Verification uses ERC-1271 on-chain contract call
 */
export const useSafeSigning = (): SigningHook => {
  const { address, chainId, chain } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()
  const {
    messageHash,
    signature,
    signingInProgress,
    setSigningInProgress,
    setMessageHash,
  } = useSigningStore()

  const {
    safeMessageHash,
    threshold,
    setSafeMessageHash,
    setThreshold,
  } = useSafeStore()

  /**
   * Compute Safe-specific message hash and threshold when messageHash changes
   * This prepares the data needed for polling
   */
  useEffect(() => {
    async function fetchSafeData() {
      if (!address || !chain || !messageHash) return

      const { safeMessageHash, threshold } = await getSafeMessageHashAndThreshold(
        messageHash,
        address as Address,
        chain
      )
      setSafeMessageHash(safeMessageHash)
      setThreshold(threshold)
    }
    fetchSafeData()
  }, [messageHash, address, chain, setSafeMessageHash, setThreshold])

  /**
   * Sign an EIP712 message with Safe multisig wallet
   * Initiates the signing flow but doesn't store signature immediately
   * Signature will be collected via polling after threshold is met
   */
  const signMessage = useCallback(
    async (message: EIP712Message) => {
      if (!address || !chainId) {
        toast.error('Wallet not connected')
        return
      }

      try {
        setSigningInProgress(true)

        // Hash the message for storage
        const hash = hashTypedData(message)
        setMessageHash(hash)

        toast.info(
          '🔐 Signing with Safe multisig... This will take as long as it takes to collect all signatures.'
        )

        // Initiate Safe signing flow
        // Note: For Safe, this triggers the multisig UI but doesn't return the final signature
        await signTypedDataAsync({
          domain: message.domain,
          types: message.types,
          primaryType: message.primaryType,
          message: message.message,
        })

        // Don't store signature here - it will be collected via polling
        // The polling hook (useSafePolling) will handle signature collection
      } catch (error) {
        if ((error as Error).message.includes('User rejected')) {
          toast.error('Signing cancelled by user')
        } else {
          toast.error('Error initiating Safe signing')
          console.error('Safe signing error:', error)
        }
        setSigningInProgress(false)
      }
    },
    [address, chainId, signTypedDataAsync, setSigningInProgress, setMessageHash]
  )

  /**
   * Verify the Safe signature using ERC-1271
   */
  const verifySignature = useCallback(async () => {
    if (!messageHash || !signature || !address) {
      toast.error('No signature to verify')
      return
    }

    await verifyERC1271Signature(address, messageHash, signature)
  }, [messageHash, signature, address])

  return {
    signMessage,
    verifySignature,
    signature,
    messageHash,
    signingInProgress,
    // Safe-specific properties (these won't be in EOA hook)
    safeMessageHash,
    threshold,
  } as any // Type assertion to allow Safe-specific properties
}
