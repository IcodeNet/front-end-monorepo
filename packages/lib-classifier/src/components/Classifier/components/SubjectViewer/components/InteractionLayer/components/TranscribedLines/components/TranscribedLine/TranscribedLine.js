import { Tooltip } from '@zooniverse/react-components'
import counterpart from 'counterpart'
import React from 'react'
import styled, { css, withTheme } from 'styled-components'

import { TranscriptionLine } from '@plugins/drawingTools/components'
import TooltipLabel from '../TooltipLabel'
import en from './locales/en'

counterpart.registerTranslations('en', en)

export const ConsensusLine = styled('g')`
  cursor: pointer;

  &:focus {
    ${props => css`outline: solid 4px ${props.focusColor};`}
  }

  ${props => css`opacity: ${props['aria-disabled'] === 'true' ? 0.3 : 1};`}
`

function createMark(line, task) {
  const { activeTool, activeToolIndex, marks, setActiveMark } = task

  if (activeTool) {
    const [ existingMark ] = marks.filter(mark => mark.id === line.id)
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = line.points
    const { id } = line
    const toolIndex = activeToolIndex
    const markSnapshot = { id, x1, y1, x2, y2, toolIndex }
    const mark = existingMark ? existingMark : activeTool.createMark(markSnapshot)
    setActiveMark(mark)

    let previousAnnotationValuesForEachMark = []
    activeTool.tasks.forEach((task) => {
      const previousAnnotationValuesForThisMark = {
        id: mark.id,
        taskKey: task.taskKey,
        taskType: task.type,
        values: line.textOptions
      }
      previousAnnotationValuesForEachMark.push(previousAnnotationValuesForThisMark)
    })
    mark.setPreviousAnnotations(previousAnnotationValuesForEachMark)
    if (existingMark) {
      mark.setSubTaskVisibility(true)
    } else {
      mark.finish()
    }
  }
}

function onKeyDown(event, line, task) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    createMark(line, task)
  }
}

export function TranscribedLine({
  disabled = false,
  id,
  line,
  scale = 1,
  task,
  theme = {
    global: {
      colors: {}
    }
  }
}) {
  const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = line.points
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const mark = { length, x1, y1, x2, y2 }

  const lineProps = {}
  if (!disabled) {
    lineProps.onClick = event => createMark(line, task)
    lineProps.onKeyDown = event => onKeyDown(event, line, task)
  }

  const focusColor = theme.global.colors[theme.global.colors.focus]
  return (
    <Tooltip
      id={id}
      label={<TooltipLabel fill='drawing-pink' label={counterpart('TranscribedLine.transcribed')} />}
    >
      <ConsensusLine
        role='button'
        aria-describedby={id}
        aria-disabled={disabled.toString()}
        aria-label={line.consensusText}
        focusColor={focusColor}
        tabIndex={disabled ? -1 : 0}
        {...lineProps}
      >
        <TranscriptionLine
          state='transcribed'
          mark={mark}
          scale={scale}
        />
      </ConsensusLine>
    </Tooltip>
  )
}


export default withTheme(TranscribedLine)
