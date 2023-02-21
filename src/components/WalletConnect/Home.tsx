import { InputMode } from '@/types/types'
import { useCallback, useState, Dispatch, SetStateAction, useMemo } from 'react'
import LedgerLivePlarformSDK, { Account } from '@ledgerhq/live-app-sdk'
import styled from 'styled-components'
import { TransitionGroup } from 'react-transition-group'
import { useTranslation } from 'next-i18next'
import useInitialization from './v2/hooks/useInitialization'
import useWalletConnectEventsManager from './v2/hooks/useWalletConnectEventsManager'
import { pair } from './v2/utils/WalletConnectUtil'
import { Connect } from './Connect'
import { NetworkConfig } from '@/types/types'
import { ResponsiveContainer } from '@/styles/styles'
import Sessions from './Sessions'
import Tabs from './Tabs'
import { Flex } from '@ledgerhq/react-ui'
import { sessionSelector, useSessionsStore } from 'src/store/Sessions.store'

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

const CONNECT_TAB_INDEX = 0
const SESSIONS_TAB_INDEX = 1

export default function Home({
	platformSDK,
	initialMode,
	accounts,
	networks,
	setUri,
}: WalletConnectProps) {
	const initialized = useInitialization()
	useWalletConnectEventsManager(initialized)

	const sessions = useSessionsStore(sessionSelector.selectSessions)

	const { t } = useTranslation()

	const [activeTabIndex, setActiveTabIndex] = useState(CONNECT_TAB_INDEX)
	const [inputValue, setInputValue] = useState<string>('')
	const [errorValue, setErrorValue] = useState<string | undefined>(undefined)

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
		[t, sessions],
	)

	return (
		<WalletConnectContainer>
			{initialized ? (
				<Tabs
					tabs={TABS}
					activeTabIndex={activeTabIndex}
					setActiveTabIndex={setActiveTabIndex}
				>
					<Flex
						flex={1}
						width="100%"
						height="100%"
						bg="background.main"
					>
						{TABS[activeTabIndex].Component}
					</Flex>
				</Tabs>
			) : null}
		</WalletConnectContainer>
	)
}
