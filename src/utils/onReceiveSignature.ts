import { toast } from "sonner"
import { verifyERC1271Signature, verifyECDSASignature } from "./verification"
import { Address, Hash } from "viem"

export async function onReceiveSignature({signature, messageHash, address, isSafe}: {
  signature: Hash,
  messageHash: Hash,
  address: Address,
  isSafe: boolean
}) {

      if (!messageHash || !address) {
        toast.error('Error: Missing messageHash or address')
        return
      }
      toast.info(`Verifying signature... ${isSafe ? '(SAFE multisig)' : '(EOA)'}`)

      // Verify signature
      const isValid = isSafe
        ? await verifyERC1271Signature(address, messageHash, signature)
        : await verifyECDSASignature(messageHash, signature, address)


      if (isValid) {
        if (isSafe) {
          toast.success('✓ SAFE multisig signature verified!')
        } else {
          toast.success('✓ EOA signature verified!')
        }
      } else {
        toast.error('✗ Signature verification failed')
      }

}

