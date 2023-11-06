import { createWeb3Modal } from '@web3modal/wagmi/react'
import {walletConnectProvider} from '@web3modal/wagmi'
import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
import { goerli, pulsechainV4, pulsechain } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import Profile from './Profile'
import Home from './Home'
import Farm from './Farms/Farm'
import Staking from './Staking/Staking'
import Footer from './Footer'
import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { useState, useEffect, createContext, useCallback } from 'react'
import { fetchData } from './FetchData'
import Portfolio from './Portfolio'
import TimelockEvents from './TimeLock'
import VaultStaking from './VaultStaking/VaultStaking'

export const InfoContext = createContext();

const projectId = import.meta.env.VITE_WALLET_CONNECT;

const { chains, publicClient, webSocketPublicCLient } = configureChains(
    [pulsechain],
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

createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: pulsechain });

function App() {
  const [allPools, setAllPools] = useState();
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    async function getData() {
      const allPools = await fetchData()
      // setTimeout(() => { setAllPools(allPools) }, 5000);
      setAllPools(allPools)
    }
    function timeInterval() {
      setTimeout(()=> {setCounter(counter+1)}, 2500);
    }
    getData();
    timeInterval();
  },[counter])

  return (
    <WagmiConfig config={wagmiConfig}>
      <InfoContext.Provider value={allPools}>
      <BrowserRouter>
        <Profile />
        <Routes>
          <Route path ='/' Component={Home} />
          <Route path ='/Farms' Component={Farm} />
          <Route path ='/Staking' Component={Staking} />
          <Route path ='/dePulse' Component={Portfolio} />
          <Route path ='/Timelock' Component={TimelockEvents} />
          <Route path ='/Stake' Component={VaultStaking} />
        </Routes>
      </BrowserRouter>
      </InfoContext.Provider>
    </WagmiConfig>
  )
}

export default App
