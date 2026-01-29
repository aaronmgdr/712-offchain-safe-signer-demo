import { FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useSigningStore } from '../stores/signingStore'
import { useEIP712Signing } from '../hooks/useEIP712Signing'
import { useWalletInfo } from '../hooks/useWalletInfo'
import { createTestMessage, formatMessageForDisplay } from '../utils/eip712'
import { useSafePolling } from '../hooks/useSafePolling'
import { onReceiveSignature } from '../utils/onReceiveSignature'

export const SigningForm: FC = () => {
  const { address, chainId, isConnected } = useAccount()
  const { isSafe, signingInProgress, messageHash, safeMessageHash, signature, resetSigningState } = useSigningStore()
  const { signMessage } = useEIP712Signing()
  const { isChecking } = useWalletInfo()
  const [customMessage, setCustomMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  useSafePolling()

  const message = useMemo(() => {
    if (!chainId) return null
    return createTestMessage(chainId, customMessage.length ? { content: customMessage, timestamp: Math.floor(Date.now() / 1000) }: undefined)
  }, [chainId, customMessage])


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
  

  const handleSign = async () => {
    if (!message) {
      throw new Error('chainId is undefined')
    }
    // this is not the sig when we are signing with safe, just a placeholder
    await signMessage(message)
  }

  return (
    <>
      {isSafe && (
        <div className="status safe">
          🔒 SAFE Multisig Detected - Signing will require multisig approval
        </div>
      )}

      <section className="account-info">
        <h2>Account Information</h2>
        <dl>
          <dt>Account:</dt>
          <dd>{address}</dd>
          <dt>Type:</dt>
          <dd>{isSafe ? 'SAFE Multisig' : 'EOA Wallet'}</dd>
        </dl>
      </section>

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
        style={{ marginBottom: '20px' }}
      >
        {showMessage ? 'Hide' : 'Show'} Message to Sign
      </button>

      {showMessage && message && (
        <>
        <div className="form-group">
          <h2>EIP712 Message:</h2>
          <textarea
            rows={44}
            readOnly
            value={formatMessageForDisplay(message)}
          />
          {messageHash && <>
            <h2>Message Hash:</h2>
            <code className='hash'>
              {messageHash}
            </code>
          </>} 
          {safeMessageHash && <>
            <h2>Safe Message Hash: </h2>
            <code className='hash'>
              {`${safeMessageHash}`}
            </code>
          </>}
        </div>
        
        </>
      )}

      <button
        onClick={handleSign}
        disabled={signingInProgress || !isConnected}
      >
        {signingInProgress ? 'Signing...' : 'Sign with EIP712'}
      </button>
      {signingInProgress || signature && (
        <button
            style={{marginTop: 10}}
            onClick={resetSigningState}
        >
            {'reset Signing State'}
        </button>
    )}
     

      {signature && (
        <section className="form-group" style={{marginTop: 20}}>
          <h2>Signature</h2>
          <textarea
            readOnly
            rows={3}
            value={signature}
            aria-label="Generated signature"
          />
          <button
            onClick={() => onReceiveSignature({signature, messageHash: messageHash!, address: address as `0x${string}`, isSafe})}
            style={{ marginTop: '10px' }}
          >
            Verify Signature
          </button>
        </section>
      )}
    </>
  )
}
