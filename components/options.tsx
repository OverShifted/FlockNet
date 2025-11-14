import Capture from '@/lib/capture'
import { evaluateColorMap } from '@/lib/colormaps'
import config from '@/lib/config'
import { linspace } from '@/lib/utils'
import {
  CallMadeRounded,
  CastForEducationRounded,
  NumbersRounded,
  PaletteRounded,
} from '@mui/icons-material'
import { Box, Chip, Input, Link, Option, Select, Tooltip } from '@mui/joy'

function ColormapOption({ v }: { v: string }) {
  return (
    <Box className="flex gap-5 justify-between w-full">
      {v}
      <Box
        className={
          'md:flex hidden' + (config.SQUARE_COLORMAP_PREVIEWS ? '' : ' gap-1')
        }
      >
        {linspace(0, 1, 10).map((x, i) => {
          const color = 'rgb({0},{1},{2})'.replace(/{(\d)}/g, (_, key) =>
            evaluateColorMap(x, v)[parseInt(key)].toString(),
          )

          return (
            <Box
              key={i}
              sx={{
                width: 20,
                height: 20,
                borderRadius: config.SQUARE_COLORMAP_PREVIEWS ? 0 : 10,
                flexShrink: 0,
                backgroundColor: color,
                marginY: 'auto',
              }}
            />
          )
        })}
      </Box>
    </Box>
  )
}

interface ColormapSelectProps {
  colorMaps: string[]
  colorMap: string
  setColorMap: (_v: string) => void
}

function ColormapSelect({
  colorMaps,
  colorMap,
  setColorMap,
}: ColormapSelectProps) {
  return (
    <Select
      // className="grow"
      value={colorMap}
      renderValue={(selected) => {
        return <ColormapOption v={selected?.value ?? ''} />
      }}
      placeholder="Color map"
      onChange={(_e: object | null, value: string | null) => {
        setColorMap(value as string)
        // vis.current?.setColorMap(buildColormap(value as string))
      }}
      // variant="plain"
      startDecorator={<PaletteRounded />}
    >
      {colorMaps.map((v) => (
        <Option key={v} value={v}>
          <ColormapOption v={v} />
        </Option>
      ))}
    </Select>
  )
}

interface OptionsProps {
  plotCount: number
  setPlotCount: (_v: number) => void

  captures: Capture[]
  captureIdx: number
  setCaptureIdx: (_v: number) => void

  colorMaps: string[]
  colorMap: string
  setColorMap: (_v: string) => void
}

function Options({
  plotCount,
  setPlotCount,
  captures,
  captureIdx,
  setCaptureIdx,
  colorMaps,
  colorMap,
  setColorMap,
}: OptionsProps) {
  return (
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
            renderValue={(value) => (
              <Box>{captures[value?.value ?? 0].name}</Box>
            )}
          >
            {captures.map((cap, idx) => (
              <Option key={idx} value={idx}>
                <Box className="flex justify-between w-full gap-5">
                  <Box className="flex gap-2">
                    {cap.name}
                    <Chip variant="outlined">
                      {cap.classes?.length} classes
                    </Chip>
                  </Box>

                  <Box className="flex gap-3">
                    <Link
                      level="body-xs"
                      href={
                        'https://github.com/OverShifted/FlockNet/tree/master/' +
                        cap.path
                      }
                      endDecorator={<CallMadeRounded />}
                      slotProps={{
                        endDecorator: {
                          sx: {
                            marginX: 0,
                          },
                        },
                      }}
                    >
                      Data
                    </Link>
                  </Box>
                </Box>
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
              setPlotCount(parseInt(e.target.value) ?? plotCount)
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
          {/* FIXME: For some reason a div wrapper is required for the tooltip to show up */}
          <div>
            <ColormapSelect
              colorMaps={colorMaps}
              colorMap={colorMap}
              setColorMap={setColorMap}
            />
          </div>
        </Tooltip>
      </Box>
    </Box>
  )
}

export { ColormapSelect, Options }
