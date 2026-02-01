import { useAccount } from 'wagmi'
import { useSafeStore } from '../stores/safeStore'
import { detectSafeWallet } from '../signing/common/walletDetection'
import { useEffect, useState } from 'react'

/**
 * Wallet information hook
 * Detects wallet type (Safe vs EOA) on connection
 */
export const useWalletInfo = () => {
  const { address, isConnected } = useAccount()
  const { setIsSafe } = useSafeStore()
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const checkIfSafe = async () => {
      if (!address) {
        setIsSafe(false)
        return
      }

      setIsChecking(true)
      try {
        const isSafe = await detectSafeWallet(address)
        setIsSafe(isSafe)
      } catch (error) {
        console.error('Error checking Safe wallet:', error)
        setIsSafe(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkIfSafe()
  }, [address, setIsSafe])

  return {
    address,
    isConnected,
    isChecking,
  }
}
