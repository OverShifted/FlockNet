import { Geist_Mono } from 'next/font/google'
import PlaybackControl from '../components/playback_control'
import VisScatterBlock from '../components/vis_scatter_block'
import { colorMapKeys } from '@/lib/colormaps'
import {
  Box,
  CssBaseline,
  CssVarsProvider,
  extendTheme,
  IconButton,
  Input,
  Link,
  Option,
  Select,
  Tooltip,
  useColorScheme,
} from '@mui/joy'
import React, { useEffect, useState } from 'react'
import GlobalController from '@/lib/global_controller'
import {
  CastForEducationRounded,
  DarkModeRounded,
  LightModeRounded,
  NumbersRounded,
} from '@mui/icons-material'
import captures from '@/lib/captures'
import Head from 'next/head'
import ClassChips from '@/components/class_chips'
import { ColormapSelect } from '@/components/options'
import { useRouter } from 'next/router'

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

function ThemeToggleButton() {
  const { mode, setMode } = useColorScheme()

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light')
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <IconButton
      variant="plain"
      color="neutral"
      onClick={toggleTheme}
      sx={{
        width: 50,
        height: 50,
        marginY: 'auto',
        borderRadius: '100%',
        borderWidth: 2,
        '& svg': {
          fontSize: '1.5rem',
        },
      }}
    >
      {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
    </IconButton>
  )
}

export default function Home() {
  // State for selected capture
  const [captureIdx, setCaptureIdx] = useState(0)
  const capture = captures[captureIdx]

  // TODO: Expensive state to handle!
  const [plotCount, setPlotCount] = useState(3)
  const [colorMap, setColorMap] = useState('tab10')
  const [classMask, setClassMask] = useState([] as number[])

  useEffect(() => {
    GlobalController.setClassMask(classMask)
  }, [classMask])

  useEffect(() => {
    const classCount = captures[captureIdx].classes?.length || 0
    setClassMask(new Array(classCount).fill(1))

    GlobalController.capture = capture
  }, [captureIdx, capture])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isInputField =
        // (target.tagName === 'INPUT' &&
        //   (target as HTMLInputElement).type !== 'number') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).isContentEditable

      if (isInputField) return

      if (event.code === 'Space') {
        event.preventDefault()
        GlobalController.setIsPlaying(!GlobalController.isPlaying)
      } else if (event.code == 'ArrowRight') {
        event.preventDefault()
        GlobalController.setTime(GlobalController.time + 1)
        GlobalController.setIsPlaying(false)
      } else if (event.code == 'ArrowLeft') {
        event.preventDefault()
        GlobalController.setTime(GlobalController.time - 1)
        GlobalController.setIsPlaying(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const router = useRouter()

  return (
    <CssVarsProvider theme={customTheme} disableTransitionOnChange>
      <CssBaseline />

      <Head>
        <title>NNVis</title>
        <link rel="icon" href={router.basePath + '/favicon.ico'} />
      </Head>

      <Box
        className="w-full px-10 pt-0 pb-3 mb-10 text-center"
        sx={(theme) => ({
          // backgroundColor: theme.vars.palette.primary[200],
          // color: theme.vars.palette.primary[900]

          backgroundColor: theme.palette.primary.plainHoverBg,
          color: theme.vars.palette.primary.softColor,
        })}
      >
        {/* <Box className="absolute top-5 right-5">
          <ThemeToggleButton />
        </Box>

        <Box className="absolute top-8 left-8 flex items-center gap-2">
          by
          <Link href="https://overshifted.github.io/">
            <div
              className="w-5 h-5 mr-2"
              style={{
                backgroundColor: 'rgb(74, 153, 255)',
              }}
            />
            OverShifted
          </Link>
        </Box>

        <h1 className="text-2xl mr-4 pt-7">Neural Network Visualizer</h1> */}

        <Box className="flex justify-between pt-6 flex-col gap-5 lg:flex-row lg:gap-0">
          <Box className="flex flex-col items-start">
            <Tooltip
              title="Neural Network Visualizer"
              arrow
              variant="outlined"
              placement="right"
            >
              <h1 className="text-2xl my-auto">NNVis</h1>
            </Tooltip>

            <Box className="top-8 left-8 flex items-center gap-1" fontSize={15}>
              by
              <Link href="https://overshifted.github.io/" fontSize={15}>
                <div
                  className="w-3.5 h-3.5 mr-1 my-auto"
                  style={{
                    backgroundColor: 'rgb(74, 153, 255)',
                  }}
                />
                OverShifted
              </Link>
            </Box>
          </Box>

          <Box className="flex gap-2 flex-col sm:flex-row">
            <Box className="my-auto">
              <Tooltip title="Capture" arrow variant="outlined">
                <Select
                  value={captureIdx}
                  onChange={(_e, idx: number | null) => {
                    setCaptureIdx(idx as number)
                  }}
                  // variant="plain"
                  startDecorator={<CastForEducationRounded />}
                >
                  {captures.map((cap, idx) => (
                    <Option key={idx} value={idx}>
                      {cap.name}
                    </Option>
                  ))}
                </Select>
              </Tooltip>
            </Box>

            <Box className="my-auto">
              <Tooltip title="# of visualizations" arrow variant="outlined">
                <Input
                  type="number"
                  value={Math.max(plotCount, 1)}
                  onChange={(e) =>
                    setPlotCount(parseInt(e.target.value) || plotCount)
                  }
                  sx={{ textAlign: 'center' }}
                  className="sm:w-30"
                  slotProps={{ input: { min: 0 } }}
                  // variant="plain"
                  startDecorator={<NumbersRounded />}
                />
              </Tooltip>
            </Box>

            <Box className="my-auto">
              <Tooltip title="Colormap" arrow variant="outlined">
                <div>
                  <ColormapSelect
                    colorMaps={colorMapKeys}
                    colorMap={colorMap}
                    setColorMap={setColorMap}
                  />
                </div>
              </Tooltip>
            </Box>
          </Box>
          <ThemeToggleButton />
        </Box>

        {/* <Options
          plotCount={plotCount}
          setPlotCount={setPlotCount}
          captures={captures}
          captureIdx={captureIdx}
          setCaptureIdx={setCaptureIdx}
          colorMaps={colorMapKeys}
          colorMap={colorMap}
          setColorMap={setColorMap}
        /> */}

        <Box className="flex flex-wrap justify-center pt-8">
          <ClassChips capture={capture} colorMap={colorMap} />
        </Box>

        <Box className="pt-4">
          <PlaybackControl maxFrame={capture.frameCount} />
        </Box>
      </Box>

      <div className={`px-4 pb-8 ${geistMono.className}`}>
        <div className="flex flex-row justify-around flex-wrap gap-2">
          {Array.from({ length: plotCount }).map((_, index) => (
            <React.Fragment key={index}>
              <VisScatterBlock
                variations={capture.variations}
                colorMap={colorMap}
              />
              {/* {index < plotCount - 1 ? (
                <Divider orientation="vertical" />
              ) : null} */}
            </React.Fragment>
          ))}
        </div>
      </div>
    </CssVarsProvider>
  )
}
