import { withKnobs } from '@storybook/addon-knobs'
import zooTheme from '@zooniverse/grommet-theme'
import React, { Component } from 'react'
import { Box, Grommet } from 'grommet'
import { Provider } from 'mobx-react'
import asyncStates from '@zooniverse/async-states'
import cuid from 'cuid'
import SingleImageViewer from '@viewers/components/SingleImageViewer'
import ClassificationStore from '@store/ClassificationStore'
import SubjectViewerStore from '@store/SubjectViewerStore'
import DrawingTask from '@plugins/tasks/DrawingTask/models/DrawingTask'
import { DrawingTaskFactory, ProjectFactory, SubjectFactory, WorkflowFactory } from '@test/factories'
import TranscriptionLine from './'

const subject = SubjectFactory.build({
  locations: [
    { 'image/jpeg': 'http://placekitten.com/500/300' }
  ]
})

const project = ProjectFactory.build()
const workflow = WorkflowFactory.build()
const drawingTaskSnapshot = DrawingTaskFactory.build({
  instruction: 'Draw a line under the text',
  taskKey: 'T1',
  tools: [{
    color: zooTheme.global.colors['drawing-orange'],
    type: 'transcriptionLine'
  }],
  type: 'drawing'
})

const subTasksSnapshot = [
  {
    instruction: 'transcribe the text.',
    taskKey: 'T0.0',
    type: 'text'
  }
]

// should think of a better way to do create bounds for the story
// this is a rough approximation of what the positioning is like now
const nodeMock = {
  getBoundingClientRect: () => ({
    x: 245,
    y: 165,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })
}

function setupStores() {
  drawingTaskSnapshot.tools[0].details = subTasksSnapshot

  const drawingTask = DrawingTask.create(drawingTaskSnapshot)
  drawingTask.setActiveTool(0)
  const transcriptionLine = drawingTask.activeTool.createMark({ x1: 100, y1: 100, x2: 200, y2: 105 })

  const mockStores = {
    classifications: ClassificationStore.create(),
    subjects: {
      active: subject
    },
    subjectViewer: SubjectViewerStore.create(),
    workflows: {
      active: { id: cuid() }
    },
    workflowSteps: {
      activeInteractionTask: {},
      activeStepTasks: [drawingTask],
      findTasksByType: () => { return [] },
      interactionTask: {}
    }
  }

  mockStores.classifications.createClassification(subject, workflow, project)

  return mockStores
}

const stores = setupStores()

function updateStores({ activeMark, finished, subtask }) {
  const [ drawingTask ] = stores.workflowSteps.activeStepTasks
  const [ transcriptionLine ] = drawingTask.marks
  if (finished) {
    drawingTask.setActiveMark(transcriptionLine.id)
    transcriptionLine.finish()
  }
  transcriptionLine.setSubTaskVisibility(subtask, nodeMock)
  if (activeMark) {
    drawingTask.setActiveMark(transcriptionLine.id)
  } else {
    drawingTask.setActiveMark(undefined)
  }
}

class DrawingStory extends Component {
  constructor() {
    super()

    this.state = {
      loadingState: asyncStates.initialized
    }
  }

  componentDidMount() {
    // what needs this time to make the svg ref to be defined?
    // 100ms isn't enough time 1000ms is
    setTimeout(() => this.setState({ loadingState: asyncStates.success }), 1000)
  }

  render() {
    return (
      <Provider classifierStore={this.props.stores}>
        <Grommet
          background={{
            dark: 'dark-1',
            light: 'light-1'
          }}
          theme={zooTheme}
          themeMode='light'
        >
          <Box height='medium' width='large'>
            <SingleImageViewer
              loadingState={this.state.loadingState}
              subject={subject}
            />
          </Box>
        </Grommet>
      </Provider>
    )
  }
}

export default {
  title: 'Drawing tools / Transcription Line',
  component: TranscriptionLine,
  parameters: {
    viewport: {
      defaultViewport: 'responsive'
    }
  }
}

export function Complete(args) {
  updateStores(args)
  return (
    <DrawingStory stores={stores} />
  )
}
Complete.args = {
  activeMark: false,
  finished: false,
  subtask: false
}

export function Active(args) {
  updateStores(args)
  return (
    <DrawingStory stores={stores} />
  )
}
Active.args = {
  activeMark: true,
  finished: false,
  subtask: false
}

export function Subtask(args) {
  updateStores(args)
  return (
    <DrawingStory stores={stores} />
  )
}
Subtask.args = {
  activeMark: true,
  finished: true,
  subtask: true
}

