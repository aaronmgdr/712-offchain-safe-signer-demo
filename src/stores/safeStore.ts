import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Hash } from 'viem'

/**
 * Safe-specific signing state
 * Contains state that only applies to Safe multisig wallets
 */
export interface SafeSigningState {
  /** Whether the connected wallet is a Safe multisig */
  isSafe: boolean
  /** Safe-wrapped message hash (different from standard EIP712 hash) */
  safeMessageHash: Hash | null
  /** Number of signatures required for multisig threshold */
  threshold: number
  /** Number of confirmations collected so far */
  confirmations: number

  // Setters
  setIsSafe: (isSafe: boolean) => void
  setSafeMessageHash: (hash: Hash | null) => void
  setThreshold: (threshold: number) => void
  setConfirmations: (confirmations: number) => void
  resetSafeState: () => void
}

export const useSafeStore = create<SafeSigningState>()(
  persist(
    (set) => ({
      // Initial state
      isSafe: false,
      safeMessageHash: null,
      threshold: 0,
      confirmations: 0,

      // Setters
      setIsSafe: (isSafe) => set({ isSafe }),
      setSafeMessageHash: (hash) => set({ safeMessageHash: hash }),
      setThreshold: (threshold) => set({ threshold }),
      setConfirmations: (confirmations) => set({ confirmations }),

      resetSafeState() {
        set({
          safeMessageHash: null,
          threshold: 0,
          confirmations: 0,
        })
      },
    }),
    {
      name: 'safe-signing-store',
      version: 1,
    }
  )
)
