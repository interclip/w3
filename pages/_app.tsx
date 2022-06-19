import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

const { chains, provider } = configureChains(
  //[process.env.NODE_ENV === "production" ?  chain.polygon : chain.polygonMumbai],
  [chain.polygonMumbai],
  [
    jsonRpcProvider({ rpc: () => ({ http: "https://polygon-mumbai.g.alchemy.com/v2/Yf4kU5azMiv-IOZ265FO2cNp_wK_LCyp" }) }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Interclip',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <div><Toaster /></div>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
