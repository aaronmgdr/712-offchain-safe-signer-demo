# EIP712 SAFE Multisig Signer Demo

A demo application for testing offchain EIP712 message signing with SAFE multisigs using Vite and Reown AppKit.

## Features

✅ **Wallet Connection** - Connect with EOA or SAFE multisig via Reown AppKit  
✅ **Automatic SAFE Detection** - Detects if wallet is SAFE smart account  
✅ **EIP712 Signing** - Sign structured typed data messages  
✅ **Persistent State** - Remembers signing state across page reloads  
✅ **Multisig Polling** - Polls SAFE Transaction Service for signature completion  
✅ **Toast Notifications** - Real-time status updates via Sonner  
✅ **ERC-1271 Ready** - Framework for contract signature verification  

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Reown Project ID
- Go to [Reown Dashboard](https://dashboard.reown.com)
- Create a new project
- Copy your Project ID

### 3. Configure Environment
```bash
cp .env.example .env.local
```
Then edit `.env.local` and add your Reown Project ID:
```
VITE_REOWN_PROJECT_ID=your_project_id_here
```

### 4. Run Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── WalletConnect.tsx   # Wallet connection button
│   └── SigningForm.tsx     # EIP712 signing form
├── hooks/              # Custom React hooks
│   ├── useEIP712Signing.ts # EIP712 signing logic
│   ├── useSafePolling.ts   # SAFE polling logic
│   └── useWalletInfo.ts    # Wallet detection
├── utils/              # Utility functions
│   ├── eip712.ts       # EIP712 message utilities
│   ├── safe.ts         # SAFE detection & polling
│   └── verification.ts # Signature verification
├── stores/             # State management
│   └── signingStore.ts # Persistent signing state (Zustand)
├── config/             # App configuration
│   └── appkit.ts       # Reown AppKit setup
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

## How It Works

### For EOA Wallets
1. Click "Sign with EIP712"
2. Approve in wallet
3. Signature appears immediately
4. Done!

### For SAFE Multisigs
1. Click "Sign with EIP712"
2. SAFE shows signing interface
3. Each multisig signer approves separately
4. App polls SAFE Transaction Service
5. Toast shows progress: "1 of 3 signatures"
6. When complete, signature appears
7. Toast persists even after page reload

## Key Components

### EIP712 Message
The demo uses a test message with:
- **Domain**: App name, version, chain ID
- **Message**: Content and timestamp
- **Signature verification**: Chain-specific

### SAFE Integration
- **Detection**: Checks if wallet address has contract code
- **Polling**: Queries `https://safe-transaction-{network}.safe.global` every 5 seconds
- **Status**: Shows confirmation progress

### Signature Verification
- **EOA**: Standard ECDSA signature verification
- **SAFE**: ERC-1271 contract signature validation


## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_REOWN_PROJECT_ID` | Yes | Reown project ID from dashboard |

## Dependencies

- **React 19** - UI framework
- **Vite** - Build tool
- **Wagmi 2** - Web3 library
- **Reown AppKit** - Wallet connection
- **Safe Protocol Kit** - SAFE integration (framework)
- **Zustand** - State management
- **TanStack Query** - Async state
- **Sonner** - Toast notifications

## Next Steps for Production

1. ✅ Implement full SAFE Protocol Kit integration
2. ✅ Add ERC-1271 signature verification contract call
3. ✅ Implement proper error handling
4. ✅ Add signature database/cache
5. ✅ Improve UX for long multisig approval times
6. ✅ Add analytics for signing attempts

## Useful Resources

- [EIP-712 Standard](https://eips.ethereum.org/EIPS/eip-712)
- [ERC-1271 Standard](https://eips.ethereum.org/EIPS/eip-1271)
- [SAFE Protocol Kit Docs](https://docs.safe.global/sdk/protocol-kit)
- [Reown AppKit Docs](https://docs.reown.com/appkit)
- [CoW DAO ERC-1271 Explanation](https://cow.fi/learn/eip-1271-explained)

## License

MIT
