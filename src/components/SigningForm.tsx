import { FC, useState } from 'react'
import { useAccount } from 'wagmi'
import { hashTypedData } from 'viem'
import { useSigningStore } from '../stores/signingStore'
import { useEIP712Signing } from '../hooks/useEIP712Signing'
import { useWalletInfo } from '../hooks/useWalletInfo'
import { createTestMessage, formatMessageForDisplay } from '../utils/eip712'
import { verifySignature } from '../utils/verification'
import { toast } from 'sonner'

export const SigningForm: FC = () => {
  const { address, chainId, isConnected } = useAccount()
  const { isSafe, signingInProgress, messageHash } = useSigningStore()
  const { signMessage } = useEIP712Signing()
  const { isChecking } = useWalletInfo()
  const [customMessage, setCustomMessage] = useState('')
  const [signature, setSignature] = useState<string>('')
  const [showMessage, setShowMessage] = useState(false)

  if (!isConnected) {
    return (
      <div className="form-group">
        <div className="status disconnected">
          ⚠ Please connect wallet to continue
        </div>
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="form-group">
        <div className="status">
          Checking wallet type...
        </div>
      </div>
    )
  }

  const message = chainId ? createTestMessage(chainId) : null

  const handleSign = async () => {
    const messageToSign = customMessage
      ? { content: customMessage, timestamp: Math.floor(Date.now() / 1000) }
      : undefined

    const sig = await signMessage(messageToSign)
    if (sig) {
      setSignature(sig)
      
      // Compute message hash for verification
      const message = chainId ? createTestMessage(chainId) : null
      if (!message || !address) {
        toast.error('Error: Missing message or address')
        return
      }

      const messageHash = hashTypedData({
        domain: message.domain,
        types: message.types,
        primaryType: message.primaryType,
        message: message.message,
      })

      // Verify signature
      const isValid = await verifySignature(
        messageHash,
        sig,
        address,
        isSafe
      )

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
  }

  return (
    <>
      {isSafe && (
        <div className="status safe">
          🔒 SAFE Multisig Detected - Signing will require multisig approval
        </div>
      )}

      <div className="account-info">
        <p>
          <strong>Account:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <p>
          <strong>Type:</strong> {isSafe ? 'SAFE Multisig' : 'EOA Wallet'}
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="custom-message">Custom Message (optional)</label>
        <input
          id="custom-message"
          type="text"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Leave empty to use default test message"
          disabled={signingInProgress}
        />
      </div>

      <button
        onClick={() => setShowMessage(!showMessage)}
        disabled={signingInProgress}
        style={{ marginBottom: '20px', background: '#667eea80' }}
      >
        {showMessage ? 'Hide' : 'Show'} Message to Sign
      </button>

      {showMessage && message && (
        <div className="form-group">
          <label>EIP712 Message:</label>
          <textarea
            readOnly
            value={formatMessageForDisplay(message)}
            style={{ background: '#f5f5f5' }}
          />
        </div>
      )}

      <button
        onClick={handleSign}
        disabled={signingInProgress || !isConnected}
      >
        {signingInProgress ? 'Signing...' : 'Sign with EIP712'}
      </button>

      {signature && (
        <div className="form-group">
          <label>Signature:</label>
          <textarea
            readOnly
            value={signature}
            style={{ background: '#f0f8ff' }}
          />
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            {messageHash && `Message Hash: ${messageHash}`}
          </p>
        </div>
      )}
    </>
  )
}
