import SignClient from '@walletconnect/sign-client'

export let signClient: SignClient

export async function createSignClient() {
	signClient = await SignClient.init({
		logger: 'debug',
		projectId: '715218e8e4d6b4ff2d859ff5b46f8771',
		relayUrl: 'wss://relay.walletconnect.com',
		metadata: {
			name: 'Ledger Wallet',
			description: 'Ledger Live Wallet with WalletConnect',
			url: 'https://walletconnect.com/',
			icons: ['https://avatars.githubusercontent.com/u/37784886'],
		},
	})
}
