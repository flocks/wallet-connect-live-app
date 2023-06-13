import { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { Container } from '@/styles/styles'
import { NetworkConfig } from '@/types/types'
import { WalletApiClientProvider } from 'src/shared/WalletApiClientProvider'
import { appSelector, useAppStore } from '@/storage/app.store'
import WalletConnect from '@/components/screens'

export { getServerSideProps } from '../lib/serverProps'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initialParams: any

const Index: NextPage = () => {
	const router = useRouter()
	const networks = useAppStore(appSelector.selectNetworks)
	const {
		params: rawParams,
		uri: rawURI,
		initialAccountId: rawInitialAccountId,
		mode: rawInitialMode,
	} = router.query

	if (!initialParams) {
		initialParams = rawParams
	}
	const params =
		rawParams && typeof rawParams === 'string'
			? JSON.parse(rawParams)
			: initialParams
			? JSON.parse(initialParams)
			: {}

	const isFromLedgerLive = !!params.isFromLedgerLive
	const networkConfigs: NetworkConfig[] = params.networks ?? networks

	const uri = rawURI && typeof rawURI === 'string' ? rawURI : undefined
	const initialAccountId =
		rawInitialAccountId && typeof rawInitialAccountId === 'string'
			? rawInitialAccountId
			: undefined
	const initialMode =
		rawInitialMode === 'scan' || rawInitialMode === 'text'
			? rawInitialMode
			: undefined

	const [isMounted, setMounted] = useState<boolean>(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	return (
		<Container>
			<Head>
				<title>Ledger Wallet Connect</title>
				<meta
					name="Ledger Wallet Connect"
					content="Ledger Wallet Connect"
				/>
			</Head>
			{isMounted ? (
				<WalletApiClientProvider networks={networkConfigs}>
					{(accounts, userId, walletInfo) => (
						<WalletConnect
							initialMode={initialMode}
							initialAccountId={initialAccountId}
							networks={networkConfigs}
							initialURI={uri}
							accounts={accounts}
							userId={userId}
							walletInfo={walletInfo}
							// TODO -Remove when V1 deprecated
							isFromLedgerLive={isFromLedgerLive}
						/>
					)}
				</WalletApiClientProvider>
			) : null}
		</Container>
	)
}

export default Index
