import { Box, Grommet } from 'grommet'
import { Provider, observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import Tasks from '@components/Classifier/components/TaskArea/components/Tasks/Tasks'
import asyncStates from '@zooniverse/async-states'
import zooTheme from '@zooniverse/grommet-theme'
import { createStore }  from '@store/helpers'

/**
  Global store. This should be created only once, otherwise the Provider will error.
*/
let store

/**
  Takes a workflow tasks object and sets up the active workflow step and classification annotations.
*/
function addStepToStore(tasks = {}, isThereTaskHelp = true) {
  const stepKey = 'S1'
  const taskKeys = Object.values(tasks).map(task => task.taskKey)
  const step = {
    stepKey,
    taskKeys
  }
  const steps = [[stepKey, step]]
  Object.values(tasks).forEach(task => {
    task.help = isThereTaskHelp ? task.help : undefined
  })
  store.workflowSteps.setStepsAndTasks({ steps, tasks })
  store.annotatedSteps.start()
}

/**
  Initialise the store state on story load.
*/
function initStore(loadingState, tasks) {
  store = store ?? createStore({
    workflows: {
      loadingState
    }
  })
  addStepToStore(tasks)
  const mockSubject = {
    id: 'subject',
    metadata: {}
  }
  const mockWorkflow = {
    id: 'workflow',
    version: '1.0'
  }
  const mockProject = {
    id: 'project'
  }
  store.classifications.createClassification(mockSubject, mockWorkflow, mockProject)
}

/**
  Scaffolding to display a set of workflow tasks in a story, with a state store.
*/
export default function MockTask({
  /** Use the dark theme */
  dark = false,
  /** show task help */
  isThereTaskHelp = true,
  /** workflow loading state */
  loadingState = asyncStates.success,
  /** subject loading state */
  subjectReadyState = asyncStates.success,
  /** a workflow tasks object */
  tasks,
  /** any other props to pass down to the tasks */
  ...taskProps
}) {
  const [ loaded, setLoaded ] = useState(false)

  useEffect(function init() {
    initStore(loadingState, tasks)
    setLoaded(true)
  }, [])

  useEffect(function onTasksChange() {
    addStepToStore(tasks, isThereTaskHelp)
  }, [isThereTaskHelp, tasks])

  useEffect(function onLoadingStateChange() {
    const { workflows } = store
    switch (loadingState) {
      case asyncStates.error: {
        workflows.onError()
        break
      }
      case asyncStates.loading: {
        workflows.onLoading()
        break
      }
      case asyncStates.success: {
        workflows.onReady()
        break
      }
    }
  }, [loadingState])

  useEffect(function onSubjectReadyStateChange() {
    const { subjectViewer } = store
    switch (subjectReadyState) {
      case asyncStates.error: {
        subjectViewer.onError()
        break
      }
      case asyncStates.loading: {
        subjectViewer.resetSubject()
        break
      }
      case asyncStates.success: {
        subjectViewer.onSubjectReady()
        break
      }
    }
  }, [subjectReadyState])

  if (!loaded) {
    return null
  }

  return (
    <Provider classifierStore={store}>
      <Grommet
        background={{
          dark: 'dark-1',
          light: 'light-1'
        }}
        theme={Object.assign({}, zooTheme, { dark })}
        themeMode={(dark) ? 'dark' : 'light'}
      >
        <Box
          background={{
            dark: 'dark-3',
            light: 'neutral-6'
          }}
          pad='1em'
          width='380px'
        >
          <Tasks
            {...taskProps}
          />
        </Box>
      </Grommet>
    </Provider>
  )
}