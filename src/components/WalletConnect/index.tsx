import { WalletConnectProps, WalletConnectV1 } from "./v1";

export default function WalletConnect({ initialURI, ...rest }: WalletConnectProps) {
    if (initialURI) {
        return <WalletConnectV1 initialURI={initialURI} {...rest} />
    }
}

