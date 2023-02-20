import { InputMode } from '@/types/types'
import { useCallback, useState, Dispatch, SetStateAction, useMemo } from 'react'
import LedgerLivePlarformSDK, { Account } from '@ledgerhq/live-app-sdk'
import styled from 'styled-components'
import { TransitionGroup } from 'react-transition-group'
import { useTranslation } from 'next-i18next'
import { Tabs } from '@ledgerhq/react-ui'
import useInitialization from './v2/hooks/useInitialization'
import useWalletConnectEventsManager from './v2/hooks/useWalletConnectEventsManager'
import { pair } from './v2/utils/WalletConnectUtil'
import { Connect } from './Connect'
import { NetworkConfig } from '@/types/types'
import { ResponsiveContainer } from '@/styles/styles'
import Sessions from './Sessions'
import { web3wallet } from '@/components/WalletConnect/v2/utils/WalletConnectUtil'

const WalletConnectContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	user-select: none;
	background: ${({ theme }) => theme.colors.background.main};
	padding-top: ${(p) => p.theme.space[5]}px;
`

const WalletConnectInnerContainer = styled(TransitionGroup)`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background: ${({ theme }) => theme.colors.background.main};
`

export type WalletConnectProps = {
	initialAccountId?: string
	initialURI?: string
	networks: NetworkConfig[]
	platformSDK: LedgerLivePlarformSDK
	accounts: Account[]
	initialMode?: InputMode
	setUri: Dispatch<SetStateAction<string | undefined>>
}

export default function Home({
	platformSDK,
	accounts,
	initialMode,
	setUri,
}: WalletConnectProps) {
	const initialized = useInitialization()
	useWalletConnectEventsManager(initialized)

	const { t } = useTranslation()

	const CONNECT_TAB_INDEX = 0
	const SESSIONS_TAB_INDEX = 1
	const [activeTabIndex, setActiveTabIndex] = useState(CONNECT_TAB_INDEX)
	const [inputValue, setInputValue] = useState<string>('')
	const [errorValue, setErrorValue] = useState<string | undefined>(undefined)

	const sessions = useMemo(
		() =>
			web3wallet ? Object.entries(web3wallet.getActiveSessions()) : [],
		[web3wallet],
	)

	const handleConnect = useCallback(
		async (inputValue: string) => {
			if (!inputValue) {
				setErrorValue(t('error.noInput'))
			} else {
				try {
					setUri(inputValue)
					const uri = new URL(inputValue)
					await pair({ uri: uri.toString() })
				} catch (error: unknown) {
					setErrorValue(t('error.invalidUri'))
				} finally {
					setUri('')
				}
			}
		},
		[inputValue],
	)

	// Those two functions are not working for now. The Tabs component doesn't currently allow to set the active tab
	const goToConnect = useCallback(() => {
		setActiveTabIndex(CONNECT_TAB_INDEX)
	}, [])

	const goToSessions = useCallback(() => {
		setActiveTabIndex(SESSIONS_TAB_INDEX)
	}, [])

	const TABS = useMemo(
		() => [
			{
				index: CONNECT_TAB_INDEX,
				title: t('connect.title'),
				Component: (
					<WalletConnectInnerContainer>
						<ResponsiveContainer>
							<Connect
								mode={initialMode}
								onConnect={handleConnect}
							/>
						</ResponsiveContainer>
					</WalletConnectInnerContainer>
				),
			},
			{
				index: SESSIONS_TAB_INDEX,
				title: t('sessions.title'),
				badge: sessions?.length || undefined,
				Component: (
					<WalletConnectInnerContainer>
						<ResponsiveContainer>
							<Sessions
								sessions={sessions}
								goToConnect={goToConnect}
							/>
						</ResponsiveContainer>
					</WalletConnectInnerContainer>
				),
			},
		],
		[t],
	)

	return (
		<WalletConnectContainer>
			{initialized ? (
				<Tabs
					tabs={TABS}
					activeIndex={activeTabIndex}
					onTabChange={setActiveTabIndex}
				/>
			) : null}
		</WalletConnectContainer>
	)
}
