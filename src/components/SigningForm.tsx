import { FC, useState } from 'react'
import { useAccount } from 'wagmi'
import { useSigningStore } from '../stores/signingStore'
import { useEIP712Signing } from '../hooks/useEIP712Signing'
import { useWalletInfo } from '../hooks/useWalletInfo'
import { createTestMessage, formatMessageForDisplay } from '../utils/eip712'
import { useSafePolling } from '../hooks/useSafePolling'
import { onReceiveSignature } from '../utils/onReceiveSignature'

export const SigningForm: FC = () => {
  const { address, chainId, isConnected } = useAccount()
  const { isSafe, signingInProgress, messageHash, safeMessageHash, setMessageHash, setSigningInProgress, signature, setSignature } = useSigningStore()
  const { signMessage } = useEIP712Signing()
  const { isChecking } = useWalletInfo()
  const [customMessage, setCustomMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  useSafePolling()

  const resetSigningState = () => {
    setSigningInProgress(false)
    setMessageHash(null)
    setSignature(null)
  }

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

    // this is not the sig when we are signing with safe, just a placeholder
    await signMessage(messageToSign)
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
      {signingInProgress && (
        <button
            style={{marginTop: 10}}
            onClick={resetSigningState}
        >
            {'reset Signing State'}
        </button>
    )}
     

      {signature && (
        <div className="form-group">
          <label>Signature:</label>
          <textarea
            readOnly
            value={signature}
            style={{ background: '#f0f8ff' }}
          />
          <button
            onClick={() => onReceiveSignature({signature, messageHash: messageHash!, address: address as `0x${string}`, isSafe})}
            style={{ marginTop: '10px' }}
          >
            Verify Signature
          </button>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            {messageHash && `Message Hash: ${messageHash}`}
            {safeMessageHash && `Safe Message Hash: ${safeMessageHash}`}
          </p>
        </div>
      )}
    </>
  )
}
