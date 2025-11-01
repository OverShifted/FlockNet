import { PauseRounded, PlayArrowRounded } from '@mui/icons-material'

const playPauseIconSx = {
  width: '100%',
  height: '100%',
}

export default function PlayPauseIcon({ isPlaying }: { isPlaying: boolean }) {
  return isPlaying ? (
    <PauseRounded sx={playPauseIconSx} />
  ) : (
    <PlayArrowRounded sx={playPauseIconSx} />
  )
}
