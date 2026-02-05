import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Hash } from 'viem'

/**
 * Generic signing state store
 * Contains state that applies to both EOA and Safe wallet signing
 *
 * For Safe-specific state (safeMessageHash, threshold, etc.),
 * see stores/safeStore.ts
 */
export interface SigningState {
  /** EIP712 message hash (standard, not Safe-wrapped) */
  messageHash: Hash | null
  /** The signature result (from either EOA or Safe) */
  signature: Hash | null
  /** Whether a signing operation is currently in progress */
  signingInProgress: boolean

  // Setters
  setMessageHash: (hash: Hash | null) => void
  setSignature: (hash: Hash | null) => void
  setSigningInProgress: (inProgress: boolean) => void
  resetSigningState: () => void
}

export const useSigningStore = create<SigningState>()(
  persist(
    (set) => ({
      // Initial state
      messageHash: null,
      signature: null,
      signingInProgress: false,

      // Setters
      setMessageHash: (hash) => set({ messageHash: hash }),
      setSignature: (sig) => set({ signature: sig, signingInProgress: false }),
      setSigningInProgress: (inProgress) => set({ signingInProgress: inProgress }),

      resetSigningState() {
        set({
          messageHash: null,
          signature: null,
          signingInProgress: false,
        })
      },
    }),
    {
      name: 'eip712-signing-store',
      version: 2, // Increment version to trigger migration
    }
  )
)
