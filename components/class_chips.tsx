import Capture from '@/lib/capture'
import { buildColormap } from '@/lib/colormaps'
import GlobalController from '@/lib/global_controller'
import { mixColors } from '@/lib/utils'
import { Chip, Tooltip } from '@mui/joy'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface ClassChipsProps {
  capture: Capture
  colorMap: string
}

export default function ClassChips({ capture, colorMap }: ClassChipsProps) {
  const [classMask, setClassMask] = useState([] as number[])
  const classes = capture.classes || []

  useEffect(() => {
    GlobalController.setClassMask(classMask)
  }, [classMask])

  useEffect(() => {
    setClassMask(new Array(classes.length).fill(1))
  }, [capture, classes.length])

  const router = useRouter()

  return classes.map((label, index) => (
    <Tooltip
      className="classChipTooltip"
      key={index}
      variant="plain"
      arrow
      keepMounted
      title={
        label.image ? (
          <Image
            style={{
              imageRendering: 'pixelated',
            }}
            width={120}
            height={120}
            src={router.basePath + label.image}
            alt=""
          />
        ) : null
      }
      // @ts-expect-error For some reason the type schema of slotProps does not allow this but it is mentioned in the documentation and just works ;)
      slotProps={
        {
          root: {
            sx: {
              backgroundColor: 'black',
              padding: 4,
              opacity: label.image ? 100 : 0,
            },
          },
          arrow: {
            sx: {
              '--joy-palette-background-surface': 'black',
            },
          },
        } satisfies unknown
      }
      onOpen={() =>
        setClassMask(
          Array.from({ length: 10 }, (_, i) => (i === index ? 1 : 0)),
        )
      }
      onClose={() => setClassMask(new Array(classMask.length).fill(1))}
    >
      <div className="p-1">
        <Chip
          key={index}
          size="lg"
          sx={(theme) => {
            const color = buildColormap(colorMap)[index]
            const light = theme.palette.mode == 'light'

            const bg = light ? 'white' : 'black'
            const fg = light ? 'black' : 'white'
            const mix = (other: string, factor: number) =>
              mixColors(color, other, factor)

            return {
              /// Pastel:
              backgroundColor: mix(bg, 0.5),
              color: mix(fg, 0.6),

              /// Realistic:
              // backgroundColor: mix(fg, 0.2),
              // color: mix(bg, 0.85),

              borderColor: mix(fg, 0.2),
              cursor: 'default',
              opacity: classMask[index] ? '100%' : '40%',
            }
          }}
        >
          {label.name}
          {label.image ? (
            <Image
              style={{
                display: 'none',
              }}
              width={0}
              height={0}
              src={router.basePath + label.image}
              alt=""
            />
          ) : null}
        </Chip>
      </div>
    </Tooltip>
  ))
}
