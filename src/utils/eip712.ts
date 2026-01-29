import {  Address } from 'viem'

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
export const createTestMessage = (chainId: number, message?: { content: string; timestamp: number }): EIP712Message => {
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
    message: message ?? {
      content: 'I approve this action',
      timestamp: Math.floor(Date.now() / 1000),
    },
  }
}


/**
 * Convert message to JSON for display
 */
export const formatMessageForDisplay = (message: EIP712Message): string => {
  return JSON.stringify(message, null, 2)
}
