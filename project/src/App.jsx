import { WagmiConfig, createConfig, configureChains, mainnet } from 'wagmi'
import { goerli, pulsechainV4 } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import Profile from './Profile'
import Home from './Home'
import Farm from './Farms/Farm'
import Staking from './Staking/Staking'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'


const { chains, publicClient, webSocketPublicCLient } = configureChains(
    [goerli],
    [alchemyProvider( {apiKey: '-dlT4kmS0NTpsMB0FxIgBslIom68vI7V'}), publicProvider()],
)

const config = createConfig({
    autoConnect: true,
    connectors: [
        new InjectedConnector({
            chains,
            options: {
                name: 'Injected',
                shimDisconnect: true,
            },
        }),
    ],
    publicClient,
    webSocketPublicCLient,
})

function App() {
  return (
    <WagmiConfig config={config}>
      <BrowserRouter>
        <Profile />
        <Routes>
          <Route path ='/' Component={Home} />
          <Route path ='/Farms' Component={Farm} />
          <Route path ='/Staking' Component={Staking} />
        </Routes>
      </BrowserRouter>
    </WagmiConfig>
  )
}

export default App
