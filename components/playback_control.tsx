import GlobalController from '@/lib/global_controller'
import { SpeedRounded } from '@mui/icons-material'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import { Input, Slider, Tooltip, useColorScheme } from '@mui/joy'
import { Button } from '@mui/joy'
import { useEffect, useState } from 'react'

interface PlaybackControlProps {
  maxFrame: number
}

export default function PlaybackControl({ maxFrame }: PlaybackControlProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [time, setTime] = useState(0)
  const [fps, setFPS] = useState(30)

  GlobalController.reactSetTime = setTime
  GlobalController.reactSetIsPlaying = setIsPlaying

  const playPauseIconSx = {
    width: '100%',
    height: '100%',
  }

  const { mode } = useColorScheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div id="playback-control">
      <Button
        id="play-button"
        onClick={() => GlobalController.setIsPlaying(!isPlaying)}
      >
        <span className="flex justify-center items-center">
          {isPlaying ? (
            <PauseRoundedIcon sx={playPauseIconSx} />
          ) : (
            <PlayArrowRoundedIcon sx={playPauseIconSx} />
          )}
        </span>
      </Button>
      <div style={{ width: '100%', position: 'relative' }}>
        <Slider
          aria-label="Frame"
          value={time + 1}
          onChange={(e) => {
            GlobalController.setIsPlaying(false)
            GlobalController.setTime(
              parseInt((e.target as HTMLInputElement).value) - 1,
            )
          }}
          min={1}
          max={maxFrame}
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
          <span className="text-gray-500"> / {maxFrame}</span>
        </span>
      </div>

      <Tooltip variant="outlined" arrow title="Playback speed">
        <Input
          type="number"
          value={fps}
          onChange={(e) => {
            setFPS(parseInt(e.target.value) ?? fps)
            GlobalController.fps = parseInt(e.target.value) ?? fps
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
