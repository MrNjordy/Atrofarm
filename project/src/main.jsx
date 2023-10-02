import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Box, ChakraProvider } from '@chakra-ui/react'
import theme from './Theme/theme.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Box bgColor='gray.800' paddingBottom={20}>
      <App />
      </Box>
    </ChakraProvider>
  </React.StrictMode>,
)
