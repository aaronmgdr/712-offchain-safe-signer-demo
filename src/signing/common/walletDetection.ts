import { publicClient } from '../../config/viemClient'

/**
 * Detect if a wallet is a Safe smart account
 * Checks if the address has contract code deployed
 *
 * @param address - The wallet address to check
 * @returns true if the address is a contract (likely a Safe), false if it's an EOA
 */
export const detectSafeWallet = async (address: string): Promise<boolean> => {
  try {
    // Check if address has code (is a contract)
    const code = await publicClient.getCode({ address: address as `0x${string}` })

    // If it has code, it's likely a Safe or other smart contract
    // Further verification can be done via ERC-1271 isValidSignature call
    return Boolean(code && code !== '0x')
  } catch (error) {
    console.error('Error detecting Safe wallet:', error)
    return false
  }
}
