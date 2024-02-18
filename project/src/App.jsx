import { useState, useEffect, createContext } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnectProvider } from '@web3modal/wagmi';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import {  pulsechain } from './utils/viem/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import Profile from './Profile';
import Home from './Home';
import Farm from './Farms/Farm';
import Pools from './Staking/Staking';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { fetchData } from './FetchData';
import Portfolio from './Portfolio';

import { Box  } from '@chakra-ui/react';
import Staking from './Staking/Staking';

  




export const InfoContext = createContext();



const projectId = import.meta.env.VITE_WALLET_CONNECT;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    // Chain configurations
    {
      id: 369,
  network: 'pulsechain',
  name: 'PulseChain',
  nativeCurrency: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
  testnet: false,
      rpcUrls: {
        default: {
          http: ['https://rpc.pulsechain.com'],
          webSocket: ['wss://pulsechain.publicnode.com'],
        },
        public: {
          http: ['https://rpc.pulsechain.com'],
          webSocket: ['wss://pulsechain.publicnode.com'],
        },
      },
    },
    // Add configurations for other chains as needed
  ],
    [alchemyProvider( {apiKey: import.meta.env.VITE_ALCHEMY}), publicProvider()],
    [walletConnectProvider({ projectId })],
)

const { connectors } = getDefaultWallets({
  appName: 'Atrofarm',
  projectId: 'ceea028c5174ba2a3edd82c3319b4522',
  chains
});

const wagmiConfig = createConfig({
    autoConnect: true,
    // connectors: [
    //     new WalletConnectConnector({ options: { projectId, showQrModal: false } }),
    //     new InjectedConnector({
    //         options: {
    //             shimDisconnect: true,
    //         },
    //     }),
    // ],
    connectors,
    publicClient,
    webSocketPublicClient,
})

// createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: pulsechain });

function App() {
  const [allPools, setAllPools] = useState();
 
  const [counter, setCounter] = useState(0);

  

 

  
    
  

  useEffect(() => {
    async function getData() {
      const allPools = await fetchData()
      // setTimeout(() => { setAllPools(allPools) }, 5000);
      setAllPools(allPools);
     
    }

    allPools ?     setInterval(() => {
                    getData();
                  }, 3000)
            : getData();
  },[])

  return (
    <Box
       bgColor='black'
       > 
       

        
    
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
      <InfoContext.Provider value={allPools}>
      
     
      <BrowserRouter>
        <Profile />
        <Routes>
          <Route path ='/' Component={Home} />
          <Route path ='/Farms' Component={Farm} />
          <Route path = '/Staking' Component={Staking} />
          <Route path ='/Pools' Component={Pools} />
          <Route path ='/dePulse' Component={Portfolio} />
        </Routes>
      </BrowserRouter>
     
      </InfoContext.Provider>
      </RainbowKitProvider>
    </WagmiConfig></Box>
  )
}

export default App
