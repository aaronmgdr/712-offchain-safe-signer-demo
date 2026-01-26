import { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { pollSafeSigningStatus } from '../utils/safe'
import { useSigningStore } from '../stores/signingStore'
import { toast } from 'sonner'
import Safe from '@safe-global/protocol-kit'
import { celo } from 'viem/chains'
import { Address, Hash } from 'viem'

// General TODOS:
// - Fix the duplicated polling logic between here and pollSafeSigningStatus
// - reduce useEffect and state usage if possible
// - handle errors more gracefully and dont clear signing data on error
// - add an explicit button to check for signatures
// - 

// ok this gets us the correct hash. now i just need to integrate it into the app correctly
async function getSafeMessageHash(messageHash: Hash, safeAddress: Address) {

   // If SAFE, initialize Safe SDK
  //  we can break this up and initialize the safe first in walletInfo or safe.ts (use to detect safe properly) 

  const safe = await Safe.init({
      provider: celo.rpcUrls.default.http[0],
      safeAddress: safeAddress
  });
  const safeMessageHash = await safe.getSafeMessageHash(messageHash);
  console.log("Safe message hash:", safeMessageHash);
}


export const useSafePolling = () => {
  const { address, chainId } = useAccount()
  const { signingInProgress, setSigningInProgress, messageHash } = useSigningStore()
  const [isPolling, setIsPolling] = useState(false)


  const startPolling = useCallback(async (msgHash: string) => {
    if (!address || !chainId) return

    getSafeMessageHash(msgHash as Hash, address as Address);

    setIsPolling(true)
    const toastId = toast.loading(
      `Waiting for SAFE multisig approval... (0 of ? signatures)`
    )


    try {
      // Simulate polling - in production, integrate real polling
      let attempts = 0
      const maxAttempts = 1

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
            address,
            msgHash,
            chainId,
            1, // Check once per interval
            0 // No delay between attempts
          )

          if (status.isComplete) {
            clearInterval(pollInterval)
            setIsPolling(false)
            setSigningInProgress(false)
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
      }, 6000) // Poll every 6 seconds
    } catch (error) {
      setIsPolling(false)
      setSigningInProgress(false)
      toast.error('Error starting SAFE polling')
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
