import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Hash } from 'viem'
export interface SigningState {
  messageHash: Hash | null
  signingInProgress: boolean
  isSafe: boolean
  signature: Hash | null
  setMessageHash: (hash: Hash | null) => void
  setSignature: (hash: Hash | null) => void
  setSigningInProgress: (inProgress: boolean) => void
  setIsSafe: (isSafe: boolean) => void
}

export const useSigningStore = create<SigningState>()(
  persist(
    (set) => ({
      messageHash: null,
      signingInProgress: false,
      isSafe: false,
      signature: null,
      setMessageHash: (hash) => set({ messageHash: hash }),
      setSignature: (sig) => set({ signature: sig, signingInProgress: sig ? false : true }),
      setSigningInProgress: (inProgress) => set({ signingInProgress: inProgress }),
      setIsSafe: (isSafe) => set({ isSafe }),
    }),
    {
      name: 'eip712-signing-store',
      version: 1,
    }
  )
)
