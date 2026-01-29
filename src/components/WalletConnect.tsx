import { FC } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

export const WalletConnect: FC = () => {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={() => open()}>
        {isConnected && address
          ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
          : 'Connect Wallet'}
      </button>
    </div>
  )
}
