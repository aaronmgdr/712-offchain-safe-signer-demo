import { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { pollSafeSigningStatus } from '../utils/safe'
import { useSigningStore } from '../stores/signingStore'
import { toast } from 'sonner'
import Safe from '@safe-global/protocol-kit'
import { Address, Chain, Hash } from 'viem'

// General TODOS:
// - reduce useEffect and state usage if possible
// - handle errors more gracefully and dont clear signing data on error
// - add an explicit button to check for signatures
// - 

// ok this gets us the correct hash. now i just need to integrate it into the app correctly
async function getSafeMessageHashAndThreshold(messageHash: Hash, safeAddress: Address, chain: Chain) {

   // If SAFE, initialize Safe SDK
  //  we can break this up and initialize the safe first in walletInfo or safe.ts (use to detect safe properly) 

  const safe = await Safe.init({
      provider: chain.rpcUrls.default.http[0],
      safeAddress: safeAddress
  });
 const [safeMessageHash, threshold] = await Promise.all([
    safe.getSafeMessageHash(messageHash),
    safe.getThreshold()
  ]);
  console.info("Safe message hash:", safeMessageHash, "messageHash:", messageHash, "threshold:", threshold, chain.id);
  return { safeMessageHash: safeMessageHash as Hash, threshold };
}


export const useSafePolling = () => {
  const { address, chain, chainId } = useAccount()
  const { signingInProgress, setSigningInProgress, messageHash, setSignature } = useSigningStore()
  const [isPolling, setIsPolling] = useState(false)


  const startPolling = useCallback(async (msgHash: Hash) => {
    if (!address || !chainId || !chain) return
    setIsPolling(true)
    
    const { safeMessageHash, threshold } = await getSafeMessageHashAndThreshold(msgHash, address as Address, chain);
    const toastId = toast.loading(
      `Waiting for SAFE multisig approval... (0 of ${threshold} signatures)`
    )
    try {
      // Simulate polling - in production, integrate real polling
      let attempts = 0
      const maxAttempts = 60 // e.g., timeout after 6 minutes
      const frequency = 6000 // 6 seconds
      const pollInterval = setInterval(async () => {
        attempts++

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setIsPolling(false)
          toast.error('Polling timeout - multisig signing cancelled', {
            id: toastId,
          })
          return
        }

        try {
          const status = await pollSafeSigningStatus(
            safeMessageHash,
            chainId,
            threshold
          )

          if (status.isComplete && status.signature) {
            clearInterval(pollInterval)
            setIsPolling(false)
            setSignature(status.signature)
            toast.success('SAFE multisig signature collected!', {
              id: toastId,
            })
          } else if (status.confirmations > 0) {
            toast.loading(
              `Waiting for SAFE multisig approval... (${status.confirmations} of ${status.threshold} signatures)`,
              { id: toastId }
            )
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, frequency)
    } catch (error) {
      setIsPolling(false)
      setSigningInProgress(false)
      toast.error('Error starting SAFE polling', {
            id: toastId,
          })
      console.error('Polling error:', error)
    }
  }, [address, chainId, setSigningInProgress])


  useEffect(() => {
    if (signingInProgress && messageHash) {
      startPolling(messageHash)
    }
  }, [signingInProgress, startPolling,messageHash])

  return {
    startPolling,
    isPolling,
  }
}
