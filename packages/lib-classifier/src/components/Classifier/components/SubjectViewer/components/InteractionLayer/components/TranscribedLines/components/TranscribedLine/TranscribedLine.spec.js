import { Tooltip } from '@zooniverse/react-components'
import { shallow } from 'enzyme'
import React from 'react'

import { reducedSubject } from '@store/TranscriptionReductions/mocks'
import TranscriptionReductions from '@store/TranscriptionReductions'
import taskRegistry from '@plugins/tasks'

import { ConsensusLine, TranscribedLine } from './TranscribedLine'

describe('Component > TranscribedLine', function () {
  let task
  let transcribedLines

  before(function () {
    const transcriptionReductions = TranscriptionReductions.create({
      reductions: [{ data: reducedSubject }],
      subjectId: '1234',
      workflowId: '5678'
    })
    const consensusLines = transcriptionReductions.consensusLines
    const transcriptionModels = taskRegistry.get('transcription')
    task = transcriptionModels.TaskModel.create({
      tools: [{
        type: 'transcriptionLine',
        tasks: [{
          instruction: 'Transcribe the text',
          taskKey: 'T1.0.0',
          type: 'text'
        }]
      }],
      instruction: 'Underline and transcribe the text',
      taskKey: 'T1',
      type: 'transcription'
    })
    task.setActiveTool(0)
    transcribedLines = consensusLines.filter(line => !line.consensusReached)
  })

  describe('disabled', function () {
    let consensusLine
    let tooltip

    before(function () {
      const [ line ] = transcribedLines
      const wrapper = shallow(
        <TranscribedLine
          id='transcribed-1'
          disabled
          line={line}
          task={task}
        />
      )
      tooltip = wrapper.find(Tooltip)
      consensusLine = wrapper.find(ConsensusLine)
    })

    it('should have a tooltip',function () {
      expect(tooltip).to.have.lengthOf(1)
    })

    it('should not be clickable', function () {
      expect(consensusLine.props().onClick).to.be.undefined()
    })

    it('should not be focusable', function () {
      expect(consensusLine.props().tabIndex).to.equal(-1)
    })
  })

  describe('active', function () {
    let consensusLine
    let tooltip

    before(function () {
      const [ line ] = transcribedLines
      const wrapper = shallow(
        <TranscribedLine
          id='transcribed-1'
          line={line}
          task={task}
        />
      )
      tooltip = wrapper.find(Tooltip)
      consensusLine = wrapper.find(ConsensusLine)
    })

    it('should have a tooltip',function () {
      expect(tooltip).to.have.lengthOf(1)
    })

    it('should be clickable', function () {
      expect(consensusLine.props().onClick).to.exist()
    })

    it('should be focusable', function () {
      expect(consensusLine.props().tabIndex).to.equal(0)
    })

    describe('for a new line', function () {
      
    })

    describe('for an existing line', function () {
      
    })
  })
})