import { useSafeStore } from '../stores/safeStore'
import { useEOASigning } from './eoa/useEOASigning'
import { useSafeSigning } from './safe/useSafeSigning'
import { useSafePolling } from './safe/useSafePolling'

/**
 * Unified signing hook that delegates to EOA or Safe implementations
 *
 * This wrapper hook automatically selects the correct signing implementation
 * based on the wallet type. Components can use this hook without needing to
 * know whether they're dealing with an EOA or Safe wallet.
 *
 * For Educational/Demo Purposes:
 * - The actual implementations are in separate files (eoa/useEOASigning.ts and safe/useSafeSigning.ts)
 * - This makes it easy to show the two different signing flows side-by-side
 * - All EOA-specific code is isolated in /signing/eoa/
 * - All Safe-specific code is isolated in /signing/safe/
 */
export const useSigning = () => {
  const { isSafe } = useSafeStore()

  // Instantiate both hooks
  const eoaSigning = useEOASigning()
  const safeSigning = useSafeSigning()

  // Safe polling hook (only active when Safe is signing)
  useSafePolling()

  // Delegate to the appropriate implementation
  return isSafe ? safeSigning : eoaSigning
}
