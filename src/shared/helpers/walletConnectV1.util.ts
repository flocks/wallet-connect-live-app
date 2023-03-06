/* eslint-disable @typescript-eslint/no-explicit-any */
import { NetworkConfig } from '@/types/types'
import { Account } from '@ledgerhq/live-app-sdk'
import WalletConnectClient from '@walletconnect/client'
import WalletConnect from '@walletconnect/client'

export let wc: WalletConnect

const isSessionConnected = (wc: WalletConnectClient) =>
	wc &&
	wc.session &&
	wc.connected &&
	wc.session.connected &&
	wc.session.peerMeta

export async function restoreClient(
	session: any,
	networks: NetworkConfig[],
	selectedAccount: Account | undefined,
	setWalletConnectClient: (
		walletConnectClient?: WalletConnect | undefined,
	) => void,
	setSession: (session: any) => void,
): Promise<void> {
	if (wc && wc.connected) {
		await wc.killSession()
	}

	wc = new WalletConnectClient({ session })

	if (selectedAccount) {
		const networkConfig = networks.find(
			(networkConfig) =>
				networkConfig.currency === selectedAccount?.currency,
		)

		if (networkConfig && isSessionConnected(wc)) {
			wc.updateSession({
				chainId: networkConfig.chainId,
				accounts: [selectedAccount.address],
			})
		}
	}

	setWalletConnectClient(wc)
	setSession(wc.session)
}

export async function createClient(
	uri: string,
	setWalletConnectClient: (
		walletConnectClient?: WalletConnect | undefined,
	) => void,
): Promise<void> {
	try {
		if (wc && wc.connected) {
			alert('kill session' + wc.session)
			// const a = await wc.killSession()
		}

		wc = new WalletConnectClient({ uri })
		alert(JSON.stringify(wc))
		if (!wc.connected) {
			alert(
				'create session' +
					JSON.stringify(wc.session) +
					'connected :' +
					wc.connected,
			)
			// await wc.createSession()
		} else {
			await wc.killSession()
		}
		alert(JSON.stringify(wc))

		setWalletConnectClient?.(wc)
	} catch (err) {
		alert(err)
	}
}
