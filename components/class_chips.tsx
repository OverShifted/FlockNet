import Capture from '@/lib/capture'
import { buildColormap } from '@/lib/colormaps'
import GlobalController from '@/lib/global_controller'
import { mixColors } from '@/lib/utils'
import { Chip, Tooltip, useColorScheme } from '@mui/joy'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface ClassChipsProps {
  capture: Capture
  colorMap: string
}

export default function ClassChips({ capture, colorMap }: ClassChipsProps) {
  const [classMask, setClassMask] = useState([] as number[])
  const classes = capture.classes ?? []

  useEffect(() => {
    GlobalController.setClassMask(classMask)
  }, [classMask])

  useEffect(() => {
    setClassMask(new Array(classes.length).fill(1))
  }, [capture, classes.length])

  const router = useRouter()
  const { mode } = useColorScheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return classes.map((clazz, index) => {
    const color = buildColormap(colorMap)[index]
    const light = !isMounted || mode == 'light'

    const bg = light ? 'white' : 'black'
    const fg = light ? 'black' : 'white'
    const mix = (other: string, factor: number) =>
      mixColors(color, other, factor)

    return (
      <Tooltip
        className="classChipTooltip"
        key={index}
        variant="plain"
        arrow
        keepMounted
        title={
          clazz.image ? (
            <Image
              loading="eager"
              style={{
                imageRendering: 'pixelated',
              }}
              width={120}
              height={120}
              src={router.basePath + clazz.image}
              alt={`Preview of ${clazz.name}`}
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
                opacity: clazz.image ? 100 : 0,
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
            sx={{
              /// Pastel:
              backgroundColor: mix(bg, 0.5),
              color: mix(fg, 0.6),

              /// Realistic:
              // backgroundColor: mix(fg, 0.2),
              // color: mix(bg, 0.85),

              borderColor: mix(fg, 0.2),
              cursor: 'default',
              opacity: classMask[index] ? '100%' : '40%',
            }}
          >
            {clazz.name}
          </Chip>
        </div>
      </Tooltip>
    )
  })
}
