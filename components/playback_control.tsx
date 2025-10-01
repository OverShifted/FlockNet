import GlobalController from '@/lib/global_controller'
import PauseRoundedIcon from '@mui/icons-material/PauseRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import { Slider, useColorScheme } from '@mui/joy'
import { Button } from '@mui/joy'
import { useState } from 'react'

interface PlaybackControlProps {
  maxFrame: number
}

export default function PlaybackControl({ maxFrame }: PlaybackControlProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [time, setTime] = useState(0)

  GlobalController.reactSetTime = setTime
  GlobalController.reactSetIsPlaying = setIsPlaying

  const playPauseIconSx = {
    width: '100%',
    height: '100%',
  }

  const { mode } = useColorScheme()

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
          sx={{
            '--Slider-railBackground': mode == 'light' ? '#fff' : '#111',

            '&:hover': {
              '--Slider-railBackground':
                mode == 'light' ? '#f7f7f7' : '#171717',
            },
          }}
        />

        <span className="absolute -bottom-0.5 left-0.5">
          <span>{time + 1}</span>
          <span className="text-gray-500"> / {maxFrame}</span>
        </span>
      </div>
    </div>
  )
}
