import { AppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { celo } from '@reown/appkit/networks'

// @ts-expect-error: Ignore missing env var error
export const projectId =  import.meta.env.VITE_REOWN_PROJECT_ID || ''

const metadata = {
  name: 'EIP712 SAFE Multisig Demo',
  description: 'Demo app for signing offchain EIP712 messages with SAFE multisigs',
  url: 'http://localhost:5173',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const chains = [celo]

export const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  ssr: false,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

// Export for use in App provider
export { AppKit, metadata }
