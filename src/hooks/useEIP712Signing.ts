import { useCallback } from 'react'
import { useAccount, useSignTypedData,  } from 'wagmi'
import { useSigningStore } from '../stores/signingStore'
import { createTestMessage } from '../utils/eip712'
import { toast } from 'sonner'
import { hashTypedData } from 'viem'



export const useEIP712Signing = () => {
  const { address, chainId } = useAccount()
  const { signTypedDataAsync } = useSignTypedData()
  const { isSafe, setSigningInProgress, setMessageHash } = useSigningStore()


 

  const signMessage = useCallback(
    async (customMessage?: Record<string, unknown>) => {
      if (!address || !chainId) {
        toast.error('Wallet not connected')
        return {signature: null, messageHash: null}
      }
       

      try {
        const message = customMessage ? 
          { ...createTestMessage(chainId), message: customMessage as Record<string, string | number | boolean> } :
          createTestMessage(chainId)

        if (isSafe) {
          toast.info('🔐 Signing with SAFE multisig... This will take as long as it takes to get all signatures.')
        }
        const messageHash = hashTypedData(message)
        setMessageHash(messageHash)
        console.log("message", message, messageHash)
        setSigningInProgress(true)

        const signature = await signTypedDataAsync({
          domain: message.domain,
          types: message.types,
          primaryType: message.primaryType,
          message: message.message,
        })
        console.log("sig", signature)
        return {signature, messageHash}
      } catch (error) {
        if ((error as Error).message.includes('User rejected')) {
          toast.error('Signing cancelled')
        } else {
          toast.error('Error signing message')
          console.error('Signing error:', error)
        }
        setSigningInProgress(false)
        return {signature: null, messageHash: null}
      }
    },
    [address, chainId, isSafe, signTypedDataAsync, setSigningInProgress, setMessageHash]
  )

  return {
    signMessage,
  }
}
