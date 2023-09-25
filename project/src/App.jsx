import { createWeb3Modal } from '@web3modal/wagmi/react'
import {walletConnectProvider} from '@web3modal/wagmi'
import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
import { goerli, pulsechainV4 } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import Profile from './Profile'
import Home from './Home'
import Farm from './Farms/Farm'
import Staking from './Staking/Staking'
import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { useState, useEffect, createContext, useCallback } from 'react'
import { fetchData } from './FetchData'

export const InfoContext = createContext();

const projectId = import.meta.env.VITE_WALLET_CONNECT;

const { chains, publicClient, webSocketPublicCLient } = configureChains(
    [pulsechainV4],
    [alchemyProvider( {apiKey: import.meta.env.VITE_ALCHEMY}), publicProvider()],
    [walletConnectProvider({ projectId })],
)

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
        new WalletConnectConnector({ options: { projectId, showQrModal: false } }),
        new InjectedConnector({
            options: {
                shimDisconnect: true,
            },
        }),
    ],
    publicClient,
    webSocketPublicCLient,
})

createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: pulsechainV4 });

function App() {
  const [allPools, setAllPools] = useState();

  useEffect(() => {
    async function getData() {
      const allPools = await fetchData()
      setTimeout(() => { setAllPools(allPools) }, 5000);
      
    }
    getData();
  },[allPools])

  return (
    <WagmiConfig config={wagmiConfig}>
      <InfoContext.Provider value={allPools}>
      <BrowserRouter>
        <Profile />
        <Routes>
          <Route path ='/' Component={Home} />
          <Route path ='/Farms' Component={Farm} />
          <Route path ='/Staking' Component={Staking} />
        </Routes>
      </BrowserRouter>
      </InfoContext.Provider>
    </WagmiConfig>
  )
}

export default App
