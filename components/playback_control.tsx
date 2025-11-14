import { globalController } from '@/lib/controller'
import { SpeedRounded } from '@mui/icons-material'
import { Input, Slider, Tooltip, useColorScheme } from '@mui/joy'
import { Button } from '@mui/joy'
import { useEffect, useState } from 'react'
import PlayPauseIcon from './play_pause_icon'

interface PlaybackControlProps {
  frameCount: number
}

export default function PlaybackControl({ frameCount }: PlaybackControlProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [time, setTime] = useState(0)
  const [fps, setFPS] = useState(30)

  useEffect(() => {
    globalController.reactSetTime = setTime
    globalController.reactSetIsPlaying = setIsPlaying
  }, [])

  const { mode } = useColorScheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex items-center gap-5 px-2 pt-2 pb-7">
      <Button
        className="inline-flex w-12 min-w-12 h-12 p-3! rounded-full!"
        onClick={() => globalController.setIsPlaying(!isPlaying)}
      >
        <span className="flex justify-center items-center">
          <PlayPauseIcon isPlaying={isPlaying} />
        </span>
      </Button>
      <div style={{ width: '100%', position: 'relative' }}>
        <Slider
          aria-label="Frame"
          value={time + 1}
          onChange={(e) => {
            globalController.setIsPlaying(false)
            globalController.setTime(
              parseInt((e.target as HTMLInputElement).value) - 1,
            )
          }}
          min={1}
          max={frameCount}
          sx={
            isMounted
              ? {
                  '--Slider-railBackground': mode == 'light' ? '#fff' : '#111',

                  '&:hover': {
                    '--Slider-railBackground':
                      mode == 'light' ? '#f7f7f7' : '#171717',
                  },
                }
              : {}
          }
        />

        <span className="absolute -bottom-0.5 left-0.5">
          <span>{(time + 1).toFixed(3)}</span>
          <span className="text-gray-500"> / {frameCount}</span>
        </span>
      </div>

      <Tooltip variant="outlined" arrow title="Playback speed">
        <Input
          type="number"
          value={fps}
          onChange={(e) => {
            setFPS(parseInt(e.target.value) ?? fps)
            globalController.fps = parseInt(e.target.value) ?? fps
          }}
          // sx={{ textAlign: 'center' }}
          className="w-42"
          slotProps={{ input: { min: 0 } }}
          // variant="plain"
          startDecorator={<SpeedRounded />}
          endDecorator="fps"
        />
      </Tooltip>
    </div>
  )
}
