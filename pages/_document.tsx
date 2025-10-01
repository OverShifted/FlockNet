import { Html, Head, Main, NextScript } from 'next/document'
import InitColorSchemeScript from '@mui/joy/InitColorSchemeScript'

export default function Document() {
  return (
    <Html lang="en">
      <Head></Head>
      <body className="antialiased">
        <InitColorSchemeScript />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
