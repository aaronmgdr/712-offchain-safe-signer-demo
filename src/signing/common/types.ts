import { Hash, Hex } from 'viem'

/**
 * Shared types for signing operations
 */

/** Result of a signing operation */
export interface SigningResult {
  signature: Hex | null
  messageHash: Hash | null
}

/** Common interface for signing hooks */
export interface SigningHook {
  signMessage: (message: any) => Promise<void>
  verifySignature: () => Promise<void>
  signature: Hex | null
  messageHash: Hash | null
  signingInProgress: boolean
}
