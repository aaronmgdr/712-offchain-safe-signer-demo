import { useCallback } from 'react'
import { useAccount, useSignTypedData,  } from 'wagmi'
import { useSigningStore } from '../stores/signingStore'
import { createTestMessage } from '../utils/eip712'
import { toast } from 'sonner'
import { hashTypedData } from 'viem'



export const useEIP712Signing = () => {
  const { address, chainId } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()
  const { isSafe, setSigningInProgress, setMessageHash, setSignature } = useSigningStore()


 

  const signMessage = useCallback(
    async (customMessage?: Record<string, unknown>) => {
      if (!address || !chainId) {
        toast.error('Wallet not connected')
        return {signature: null, messageHash: null}
      }
       

      try {
        setSigningInProgress(true)
        const message = customMessage ? 
          { ...createTestMessage(chainId), message: customMessage as Record<string, string | number | boolean> } :
          createTestMessage(chainId)
      
        const messageHash = hashTypedData(message)
        setMessageHash(messageHash)
        if (isSafe) {
          toast.info('🔐 Signing with SAFE multisig... This will take as long as it takes to get all signatures.')
        }

        const signatureIfEOA = await signTypedDataAsync({
          domain: message.domain,
          types: message.types,
          primaryType: message.primaryType,
          message: message.message,
        })
        if (!isSafe) {
          setSignature(signatureIfEOA)
          toast.success('✅ Message signed successfully!')
        }
      } catch (error) {
        if ((error as Error).message.includes('User rejected')) {
          toast.error('Signing cancelled')
        } else {
          toast.error('Error signing message')
          console.error('Signing error:', error)
        }
        setSigningInProgress(false)
      }
    },
    [address, chainId, isSafe, signTypedDataAsync, setSigningInProgress, setMessageHash]
  )

  return {
    signMessage,
  }
}
