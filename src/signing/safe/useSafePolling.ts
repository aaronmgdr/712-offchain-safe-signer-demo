import { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import { useSigningStore } from '../../stores/signingStore'
import { useSafeStore } from '../../stores/safeStore'
import { pollSafeSigningStatus } from './safeApi'

/**
 * Safe multisig polling hook
 *
 * Polls the Safe Transaction Service API to monitor multisig signature collection.
 * Triggers automatically when signing is in progress and Safe message hash is available.
 * Updates confirmation count and stores final signature when threshold is met.
 */
export const useSafePolling = () => {
  const { address, chainId } = useAccount()
  const { signingInProgress, setSigningInProgress, setSignature } = useSigningStore()
  const { safeMessageHash, threshold, setConfirmations } = useSafeStore()
  const [isPolling, setIsPolling] = useState(false)

  /**
   * Start polling the Safe Transaction Service
   * Runs every 6 seconds, times out after 60 attempts (~6 minutes)
   */
  const startPolling = useCallback(() => {
    // Guard: can't poll without required data
    if (!address || !chainId || !safeMessageHash) return () => {}

    setIsPolling(true)

    const toastId = toast.loading(
      `Waiting for Safe multisig approval... (0 of ${threshold} signatures)`
    )

    try {
      let attempts = 0
      const maxAttempts = 60 // Timeout after 6 minutes
      const frequency = 6000 // Poll every 6 seconds

      const pollInterval = setInterval(async () => {
        attempts++

        // Timeout check
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setIsPolling(false)
          toast.error('Polling timeout - multisig signing cancelled', {
            id: toastId,
          })
          return
        }

        try {
          // Query Safe Transaction Service for signature status
          const status = await pollSafeSigningStatus(safeMessageHash, chainId, threshold)

          // Update confirmation count
          if (status.confirmations > 0) {
            setConfirmations(status.confirmations)
          }

          // Check if signature is complete
          if (status.isComplete && status.signature) {
            clearInterval(pollInterval)
            setIsPolling(false)
            setSignature(status.signature)
            toast.success('Safe multisig signature collected!', {
              id: toastId,
            })
          } else if (status.confirmations > 0) {
            // Update progress toast
            toast.loading(
              `Waiting for Safe multisig approval... (${status.confirmations} of ${status.threshold} signatures)`,
              { id: toastId }
            )
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, frequency)

      // Return cleanup function
      return () => {
        clearInterval(pollInterval)
        toast.dismiss(toastId)
      }
    } catch (error) {
      setIsPolling(false)
      setSigningInProgress(false)
      toast.error('Error starting Safe polling', {
        id: toastId,
      })
      console.error('Polling error:', error)
      return () => {
        toast.dismiss(toastId)
      }
    }
  }, [address, chainId, setSigningInProgress, safeMessageHash, threshold, setSignature, setConfirmations])

  /**
   * Auto-start polling when signing begins
   */
  useEffect(() => {
    if (signingInProgress) {
      return startPolling()
    }
  }, [signingInProgress, startPolling])

  return {
    startPolling,
    isPolling,
  }
}
