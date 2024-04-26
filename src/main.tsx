import React from 'react'
import { extendTheme, type ThemeConfig, ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
}

const theme = extendTheme({ config })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider theme={theme}>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </ChakraProvider>
)
