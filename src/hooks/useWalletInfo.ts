import { useAccount } from 'wagmi'
import { useSigningStore } from '../stores/signingStore'
import { detectSafeWallet } from '../utils/safe'
import { useEffect, useState } from 'react'

export const useWalletInfo = () => {
  const { address, isConnected, chain } = useAccount()
  
  const { setIsSafe } = useSigningStore()
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
        console.error('Error checking SAFE wallet:', error)
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
