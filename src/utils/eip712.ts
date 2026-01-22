import {  keccak256, Address } from 'viem'

export interface EIP712Domain {
  name: string
  version: string
  chainId: number
  verifyingContract?: Address
}

export interface EIP712Message {
  message: Record<string, string | number | boolean>
  domain: EIP712Domain
  primaryType: string
  types: Record<string, Array<{ name: string; type: string }>>
}

/**
 * Create a standard EIP712 typed data message for testing
 */
export const createTestMessage = (chainId: number): EIP712Message => {
  return {
    domain: {
      name: 'SAFE Signer Demo',
      version: '1',
      chainId,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    primaryType: 'Message',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Message: [
        { name: 'content', type: 'string' },
        { name: 'timestamp', type: 'uint256' },
      ],
    },
    message: {
      content: 'I approve this action',
      timestamp: Math.floor(Date.now() / 1000),
    },
  }
}

/**
 * Hash EIP712 message domain
 */
export const hashDomain = (domain: EIP712Domain): string => {
  const domainTypeHash = keccak256(
    Buffer.from(
      'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)',
      'utf-8'
    )
  )
  
  // Simplified domain hashing - in production use ethers.js/viem utilities
  return domainTypeHash
}

/**
 * Convert message to JSON for display
 */
export const formatMessageForDisplay = (message: EIP712Message): string => {
  return JSON.stringify(message, null, 2)
}
