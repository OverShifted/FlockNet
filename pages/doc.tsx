import captures from '@/lib/captures'
import Doc from '@/components/doc_content.mdx'
import styles from '@/styles/doc.module.scss'

import { Space_Grotesk, Geist_Mono } from 'next/font/google'
import { CssBaseline, CssVarsProvider, extendTheme } from '@mui/joy'
import Head from 'next/head'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const customTheme = extendTheme({
  fontFamily: {
    display: geistMono.style.fontFamily, // applies to `h1`–`h4`
    body: geistMono.style.fontFamily, // applies to `title-*` and `body-*`
  },
})

function Page() {
  return (
    <>
      <Head>
        <title>Maing of FlockNet</title>
        {/* <link rel="icon" href={router.basePath + '/favicon.ico'} /> */}
      </Head>
      <div className={`${styles.markdownRoot} ${spaceGrotesk.className}`}>
        <div>
          <Doc classes={styles} capture={captures[5]} monoFont={geistMono} />
        </div>
      </div>
    </>
  )
}

export default function ThemedPage() {
  return (
    <CssVarsProvider theme={customTheme} disableTransitionOnChange>
      <CssBaseline />
      <Page />
    </CssVarsProvider>
  )
}
