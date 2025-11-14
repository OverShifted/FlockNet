import { buildColormap } from '@/lib/colormaps'
import { Controller, globalController } from '@/lib/controller'
import Variation from '@/lib/variation'
import { MouseCollision, Visualization } from '@/lib/visualization'
import {
  GrainRounded,
  LayersRounded,
  SettingsRounded,
  SsidChartRounded,
  TuneRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Option,
  Select,
  Slider,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/joy'
import { useRouter } from 'next/router'
import { RefObject, useEffect, useId, useRef, useState } from 'react'
import PlayPauseIcon from './play_pause_icon'
import Image from 'next/image'

function VariationOption({
  variation,
  small,
}: {
  variation: Variation
  small?: boolean
}) {
  const match = variation.name.match(/bw(\d+(?:\.\d+)?)-f(\d+(?:\.\d+)?)/)
  if (match) {
    const bw = match[1]
    const ff = 'fp' + match[2]
    return (
      <Box className="flex gap-1">
        <Chip
          variant="soft"
          color="primary"
          size={(small ?? false) ? 'sm' : 'md'}
        >
          &omega;={bw}
        </Chip>
        <Chip
          variant="soft"
          color="success"
          size={(small ?? false) ? 'sm' : 'md'}
        >
          {ff}
        </Chip>
      </Box>
    )
  }
  return variation.name
}

function EmbeddedPlaybackController({
  controller,
  className,
}: {
  controller: Controller
  className: string
}) {
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    controller.reactSetIsPlaying = setIsPlaying
  }, [controller])

  return (
    <div
      data-is-playing={isPlaying}
      className={`absolute ${className}`}
      style={{ bottom: '1rem', left: '1rem' }}
    >
      <Button
        className="inline-flex w-9 min-w-9 h-9 min-h-9! p-2! rounded-full!"
        variant="plain"
        color="neutral"
        onClick={() => controller.setIsPlaying(!isPlaying)}
      >
        <span className="flex justify-center items-center">
          <PlayPauseIcon isPlaying={isPlaying} />
        </span>
      </Button>
    </div>
  )
}

interface VisScatterBlockProps {
  variations: Variation[]
  colorMap: string

  controller?: Controller
  showControls?: boolean
  showPlaybackControls?: boolean
  playbackControlsClassName?: string
}

export default function VisScatterBlock({
  variations,
  colorMap,
  controller: passedController,
  showControls: passedShowControls,

  showPlaybackControls: passedShowPlaybackControls,
  playbackControlsClassName: passedShowPlaybackControlsClassName,
}: VisScatterBlockProps) {
  const showControls = passedShowControls ?? true
  const showPlaybackControls = passedShowPlaybackControls ?? false
  const playbackControlsClassName = passedShowPlaybackControlsClassName ?? ''

  const componentId = useId()

  const canvas: RefObject<HTMLCanvasElement | null> = useRef(null)
  const vis: RefObject<Visualization | null> = useRef(null)
  const prevVariations: RefObject<Variation[] | null> = useRef(null)

  const [variation, setVariation] = useState(0)
  const [channel, setChannel] = useState(0)
  // const [colorMap, setColorMap] = useState(colorMaps[0])
  const [isLoading, setIsLoading] = useState(true)
  const [loadPercentage, setLoadPercentage] = useState(0)
  const [mouseCollision, setMouseCollision] = useState<MouseCollision | null>(null)

  const [renderStyle, setRenderStyle] = useState('dots')
  const [tailFalloff, setTailFalloff] = useState(10)
  const [radius, setRadius] = useState(2.5)
  const [opacity, setOpacity] = useState(100)
  const [fraction, _setFraction] = useState(2000)

  const controller = passedController ?? globalController

  /* eslint react-hooks/exhaustive-deps: 0 */
  useEffect(() => {
    vis.current = new Visualization(
      componentId,
      canvas.current as HTMLCanvasElement,
      controller,
      setIsLoading,
      setLoadPercentage,
      setMouseCollision,
      {
        channel,
        colorMap: buildColormap(colorMap),
        renderStyle,
        tailFalloff,
        radius,
        opacity,
        fraction,
      },
    )

    controller.register(componentId, vis.current)
    return () => {
      controller.unRegister(componentId)
      vis.current?.shutdown()
    }
  }, [])

  const router = useRouter()
  useEffect(() => {
    if (prevVariations.current === variations) {
      vis.current?.setVariation(variations[variation], router.basePath)
    } else {
      setVariation(0)
      setChannel(0)

      vis.current?.setVariation(variations[0], router.basePath)
      vis.current?.setChannel(0)

      prevVariations.current = variations
    }
  }, [variations, variation])

  useEffect(() => {
    vis.current?.setColorMap(buildColormap(colorMap as string))
    vis.current?.setChannel(channel)
    vis.current?.setRenderStyle(renderStyle)
    vis.current?.setTailFalloff(tailFalloff)
    vis.current?.setRadius(radius)
    vis.current?.setOpacity(opacity)
  }, [colorMap, channel, renderStyle, tailFalloff, radius, opacity])

  const radiusResolution = 100

  return (
    <div className="mb-10 max-w-full">
      {showControls && (
        <div className="flex items-stretch justify-evenly gap-2">
          <Tooltip
            arrow
            variant="outlined"
            title="Variation: different smoothness levels and floating point formats"
          >
            <Select
              startDecorator={<TuneRounded />}
              className="grow"
              value={variation}
              placeholder="Variation"
              onChange={(_, value) => setVariation(value ?? 0)}
              // renderValue={selected => <VariationOption variation={variations[selected?.value ?? 0]} />}
              renderValue={(selected) => variations[selected?.value ?? 0].name}
            >
              {variations.map((v, index) => (
                <Option value={index} key={index}>
                  <VariationOption variation={v} />
                </Option>
              ))}
            </Select>
          </Tooltip>

          <Tooltip
            arrow
            variant="outlined"
            title="Channel: the stage at which data was captured. e.g. different NN layers"
          >
            <Select
              startDecorator={<LayersRounded />}
              className="grow"
              value={channel}
              placeholder="Channel"
              onChange={(_, value) => setChannel(value ?? 0)}
            >
              {variations[variation]?.channels.map((v, index) => (
                <Option value={index} key={index}>
                  {v.name}
                </Option>
              ))}
            </Select>
          </Tooltip>

          <ToggleButtonGroup
            value={renderStyle}
            onChange={(_, value) => setRenderStyle(value ?? 'dots')}
            aria-label="Render style"
            size="sm"
          >
            <Tooltip arrow variant="outlined" title="Dots">
              <Button value="dots">
                <GrainRounded />
              </Button>
            </Tooltip>

            <Tooltip arrow variant="outlined" title="Lines (tail)">
              <Button value="lines-tail">
                <SsidChartRounded />
              </Button>
            </Tooltip>
            {/* <Button className="grow-1" value="dots-tail">Budget-mode Tail</Button> */}
            {/* <Button className="grow-1" value="lines-tail">Totally Accurate Tail Simulation</Button> */}
          </ToggleButtonGroup>

          <Tooltip
            arrow
            placement="bottom-end"
            variant="outlined"
            leaveDelay={300}
            // describeChild
            disableFocusListener
            title={
              <div className="w-80 pl-2.5 pr-4">
                <div className="flex items-center justify-evenly -mb-3">
                  <label className="min-w-18">Radius</label>
                  <Slider
                    aria-label="Radius"
                    value={radius * radiusResolution}
                    onChange={(_, value) =>
                      setRadius((value as number) / radiusResolution)
                    }
                    min={1 * radiusResolution}
                    max={20 * radiusResolution}
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-evenly">
                  <label className="min-w-18">Opacity</label>
                  <Slider
                    aria-label="Opacity"
                    value={opacity}
                    onChange={(_, value) => setOpacity(value as number)}
                    min={0}
                    max={100}
                    size="sm"
                  />
                </div>

                <Divider>Tail</Divider>

                <div className="flex items-center justify-evenly">
                  <label className="min-w-18">Falloff</label>
                  <Slider
                    disabled={!renderStyle.endsWith('tail')}
                    aria-label="Tail falloff"
                    value={tailFalloff}
                    onChange={(_, value) => setTailFalloff(value as number)}
                    max={100}
                    size="sm"
                  />
                </div>
              </div>
            }
          >
            <Button sx={{ padding: 1 }} size="sm">
              <SettingsRounded />
            </Button>
          </Tooltip>
        </div>
      )}

      {/* <div className="flex items-center justify-evenly mb-0 pl-2.5 pr-4">
                <label className="min-w-35">Fraction</label>
                <Slider aria-label="Fraction" value={fraction} onChange={(_e: object, value: number | number[]) => {
                    setFraction(value as number)
                    vis.current?.setFraction(value as number)
                }} min={0} max={2000} size="sm" />
            </div> */}

      <div className="relative mt-3">
        {mouseCollision && controller.capture?.hasXPreview && (
          <Tooltip
            key={mouseCollision.sampleIdx}
            sx={{ pointerEvents: 'none' }}
            title={
              <Image
                loading="eager"
                style={{
                  imageRendering: 'pixelated',
                }}
                width={120}
                height={120}
                src={
                  router.basePath +
                  `${controller.capture?.path.replace('public', '')}/anim_x/${mouseCollision.sampleIdx}.png`
                }
                alt={`Preview of ${mouseCollision.sampleIdx} ${mouseCollision.mouseX}`}
              />
            }
            open={true}
            variant="outlined"
            arrow
            placement='top'
          >
            <div
              className="absolute select-none"
              style={{
                // top: mouseCollision.mouseY,
                // left: mouseCollision.mouseX,

                top: mouseCollision.sampleY - radius,
                left: mouseCollision.sampleX,

                // width: 1,
                // height: 1,
                // background: 'magenta'
              }}
            ></div>
          </Tooltip>
        )}

        {isLoading && (
          <div
            className="absolute"
            style={{ top: 'calc(50% - 32px)', left: 'calc(50% - 32px)' }}
          >
            <CircularProgress
              value={isNaN(loadPercentage) ? undefined : loadPercentage}
              size="lg"
            >
              <Typography>
                {isNaN(loadPercentage) ? '' : `${Math.trunc(loadPercentage)}%`}
              </Typography>
            </CircularProgress>
          </div>
        )}

        {showPlaybackControls && (
          <EmbeddedPlaybackController
            controller={controller}
            className={playbackControlsClassName}
          />
        )}
        <canvas
          ref={canvas}
          width="1024px"
          height="1024px"
          className="block border border-solid rounded-md w-full max-w-lg"
        />
      </div>
    </div>
  )
}
