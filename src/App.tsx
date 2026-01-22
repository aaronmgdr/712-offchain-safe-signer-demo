import { FC } from 'react'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './config/appkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { WalletConnect } from './components/WalletConnect'
import { SigningForm } from './components/SigningForm'

const queryClient = new QueryClient()

const App: FC = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="container">
          <h1>🔐 EIP712 SAFE Multisig Signer</h1>
          <WalletConnect />
          <SigningForm />
        </div>
        <Toaster position="top-center" />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
