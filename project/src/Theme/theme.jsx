import { extendTheme } from '@chakra-ui/react'
import '@fontsource-variable/lexend-deca';
import '@fontsource/rajdhani';

const breakpoints = {
    base: '0em',
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  }

const theme = extendTheme({
  fonts: {
    heading: `'Lexend Deca Variable', sans-serif;`,
    fantasy: `'Rajdhani', sans-serif;`
  },
  breakpoints,
})

export default theme