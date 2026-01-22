import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SigningState {
  messageHash: string | null
  signingInProgress: boolean
  isSafe: boolean
  setMessageHash: (hash: string | null) => void
  setSigningInProgress: (inProgress: boolean) => void
  setIsSafe: (isSafe: boolean) => void
}

export const useSigningStore = create<SigningState>()(
  persist(
    (set) => ({
      messageHash: null,
      signingInProgress: false,
      isSafe: false,
      setMessageHash: (hash) => set({ messageHash: hash }),
      setSigningInProgress: (inProgress) => set({ signingInProgress: inProgress }),
      setIsSafe: (isSafe) => set({ isSafe }),
    }),
    {
      name: 'eip712-signing-store',
      version: 1,
    }
  )
)
