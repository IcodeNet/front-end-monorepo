import { mount, shallow } from 'enzyme'
import { Provider } from 'mobx-react'
import sinon from 'sinon'
import React from 'react'
import TranscriptionReductions from '@store/TranscriptionReductions'
import taskRegistry from '@plugins/tasks'
import { ConsensusLine, TranscribedLines } from './TranscribedLines'
import { reducedSubject } from '@store/TranscriptionReductions/mocks'
import { TranscriptionLine } from '@plugins/drawingTools/components'
import ConsensusPopup from './components/ConsensusPopup'
import TranscribedLine from './components/TranscribedLine'
import zooTheme from '@zooniverse/grommet-theme'

describe('Component > TranscribedLines', function () {
  let wrapper, task, consensusLines
  before(function () {
    const transcriptionReductions = TranscriptionReductions.create({
      reductions: [{ data: reducedSubject }],
      subjectId: '1234',
      workflowId: '5678'
    })
    consensusLines = transcriptionReductions.consensusLines
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
  })

  it('should render without crashing', function () {
    wrapper = shallow(<TranscribedLines lines={consensusLines} task={task} />)
    expect(wrapper).to.be.ok()
  })

  describe('when on a step without the transcription task', function () {
    before(function () {
      wrapper = shallow(<TranscribedLines lines={consensusLines} />)
    })

    it('should disable the incomplete lines', function () {
      const transcribedLines = wrapper.find(TranscribedLine)
      transcribedLines.forEach((line) => {
        expect(line.props().disabled).to.be.true()
      })
    })

    it('should not disable the complete lines', function () {
      const completedLines = wrapper.find(TranscriptionLine).find({ state: 'completed' })
      completedLines.forEach((line) => {
        const consensusLineWrapper = line.parent()
        expect(consensusLineWrapper.props()['aria-disabled']).to.be.undefined()
      })
    })
  })

  describe('with all lines', function () {
    let consensusComponents, createMarkSpy, returnRefs, showConsensusStub

    before(function () {
      sinon.spy(React, 'createRef')
      showConsensusStub = sinon.stub(TranscribedLines.prototype, 'showConsensus')
      wrapper = mount(
        <svg>
          <TranscribedLines
            lines={consensusLines}
            task={task}
            theme={zooTheme}
          />
        </svg>,
        {
          wrappingComponent: Provider,
          wrappingComponentProps: {
            classifierStore: {
              workflows: {
                active: {
                  usesTranscriptionTask: true
                }
              }
            }
          }
        }
      )

      returnRefs = React.createRef.returnValues
      consensusComponents = wrapper.find(ConsensusLine)
    })

    after(function () {
      task.setActiveMark(undefined)
      React.createRef.restore()
      showConsensusStub.restore()
    })

    it('should create a ref for each completed line', function () {
      const completedLines = consensusLines.filter(line => line.consensusReached)
      expect(React.createRef.callCount).to.equal(completedLines.length)
    })

    it('should call ConsensusLine callback with expected ref on click', function () {
      consensusComponents.forEach((consensusComponent, index) => {
        const lineState = consensusComponent.find(TranscriptionLine).prop('state')
        if (lineState === 'transcribed') {
          expect(createMarkSpy).to.not.have.been.called()
          consensusComponent.simulate('click')
          const [createMarkArgs] = createMarkSpy.args
          const expectedRefForMark = createMarkArgs[1]
          expect(expectedRefForMark).to.equal(returnRefs[index])
          createMarkSpy.resetHistory()
        }
        if (lineState === 'complete') {
          expect(showConsensusStub).to.not.have.been.called()
          consensusComponent.simulate('click')
          const [completeArgs] = showConsensusStub.args
          const expectedRefForMark = completeArgs[1]
          expect(expectedRefForMark).to.equal(returnRefs[index])
          showConsensusStub.resetHistory()
        }
      })
    })

    it('should call ConsensusLine callback with expected ref on keydown with enter', function () {
      const eventMock = { key: 'Enter', preventDefault: sinon.spy() }
      consensusComponents.forEach((consensusComponent, index) => {
        const lineState = consensusComponent.find(TranscriptionLine).prop('state')
        if (lineState === 'transcribed') {
          expect(createMarkSpy).to.not.have.been.called()
          consensusComponent.simulate('keydown', eventMock)
          const [createMarkArgs] = createMarkSpy.args
          const expectedRefForMark = createMarkArgs[1]
          expect(expectedRefForMark).to.equal(returnRefs[index])
          createMarkSpy.resetHistory()
        }
        if (lineState === 'complete') {
          expect(showConsensusStub).to.not.have.been.called()
          consensusComponent.simulate('keydown', eventMock)
          const [completeArgs] = showConsensusStub.args
          const expectedRefForMark = completeArgs[1]
          expect(expectedRefForMark).to.equal(returnRefs[index])
          showConsensusStub.resetHistory()
        }
      })
    })

    it('should call ConsensusLine callback with expected ref on keydown with space', function () {
      const eventMock = { key: ' ', preventDefault: sinon.spy() }
      consensusComponents.forEach((consensusComponent, index) => {
        const lineState = consensusComponent.find(TranscriptionLine).prop('state')
        if (lineState === 'transcribed') {
          expect(createMarkSpy).to.not.have.been.called()
          consensusComponent.simulate('keydown', eventMock)
          const [createMarkArgs] = createMarkSpy.args
          const expectedRefForMark = createMarkArgs[1]
          expect(expectedRefForMark).to.equal(returnRefs[index])
          createMarkSpy.resetHistory()
        }
        if (lineState === 'complete') {
          expect(showConsensusStub).to.not.have.been.called()
          consensusComponent.simulate('keydown', eventMock)
          const [completeArgs] = showConsensusStub.args
          const expectedRefForMark = completeArgs[1]
          expect(expectedRefForMark).to.equal(returnRefs[index])
          showConsensusStub.resetHistory()
        }
      })
    })
  })

  describe('incomplete lines', function () {
    const currentMock = {
      current: {
        blur: sinon.spy(),
        getBoundingClientRect: sinon.spy()
      }
    }
    let lines

    before(function () {
      wrapper = shallow(<TranscribedLines lines={consensusLines} task={task} />)
      lines = wrapper.find(TranscribedLine)
    })

    afterEach(function () {
      currentMock.current.blur.resetHistory()
    })

    it('should render', function () {
      const transcribedLines = consensusLines.filter(line => !line.consensusReached)
      expect(lines).to.have.lengthOf(transcribedLines.length)
    })

    it('should not be disabled', function () {
      lines.forEach(line => {
        expect(line.props().disabled).to.be.false()
      })
    })
  })

  describe('completed lines', function () {
    let lines, completeLines
    before(function () {
      wrapper = shallow(<TranscribedLines lines={consensusLines} task={task} />)
      lines = wrapper.find(TranscriptionLine).find({ state: 'complete' })
      completeLines = consensusLines.filter(line => line.consensusReached)
    })

    it('should render', function () {
      expect(lines).to.have.lengthOf(completeLines.length)
    })

    it('should be labelled with the consensus text', function () {
      lines.forEach((component, index) => {
        const consensusLineWrapper = component.parent()
        expect(consensusLineWrapper.props()['aria-label']).to.equal(completeLines[index].consensusText)
      })
    })

    it('should be focusable', function () {
      lines.forEach((component) => {
        const consensusLineWrapper = component.parent()
        expect(consensusLineWrapper.props().tabIndex).to.equal(0)
      })
    })

    it('should have an explanatory tooltip', function () {
      lines.forEach((component, index) => {
        const tooltip = wrapper.find({ id: `complete-${index}` })
        expect(tooltip).to.have.lengthOf(1)
      })
    })

    it('should show the ConsensusPopup onClick', function () {
      lines.forEach((line, index) => {
        let popup = wrapper.find(ConsensusPopup)
        expect(popup.props().active).to.be.false()
        expect(popup.props().line).to.deep.equal({
          consensusText: '',
          textOptions: []
        })
        wrapper.find({ 'aria-describedby': `complete-${index}` }).simulate('click')
        popup = wrapper.find(ConsensusPopup)
        expect(popup.props().active).to.be.true()
        expect(popup.props().line).to.deep.equal(completeLines[index])
        wrapper.instance().close()
        popup = wrapper.find(ConsensusPopup)
        expect(popup.props().active).to.be.false()
        expect(popup.props().line).to.deep.equal({
          consensusText: '',
          textOptions: []
        })
      })
    })

    it('should show the ConsensusPopup onKeyDown with enter', function () {
      const eventMock = { key: 'Enter', preventDefault: sinon.spy() }
      lines.forEach((line, index) => {
        let popup = wrapper.find(ConsensusPopup)
        expect(popup.props().active).to.be.false()
        expect(popup.props().line).to.deep.equal({
          consensusText: '',
          textOptions: []
        })
        wrapper.find({ 'aria-describedby': `complete-${index}` }).simulate('keydown', eventMock)
        popup = wrapper.find(ConsensusPopup)
        expect(eventMock.preventDefault).to.have.been.calledOnce()
        expect(popup.props().active).to.be.true()
        expect(popup.props().line).to.deep.equal(completeLines[index])
        wrapper.instance().close()
        popup = wrapper.find(ConsensusPopup)
        expect(popup.props().active).to.be.false()
        expect(popup.props().line).to.deep.equal({
          consensusText: '',
          textOptions: []
        })
        eventMock.preventDefault.resetHistory()
      })
    })

    it('should show the ConsensusPopup onKeyDown with space', function () {
      const eventMock = { key: ' ', preventDefault: sinon.spy() }
      lines.forEach((line, index) => {
        let popup = wrapper.find(ConsensusPopup)
        expect(popup.props().active).to.be.false()
        expect(popup.props().line).to.deep.equal({
          consensusText: '',
          textOptions: []
        })
        wrapper.find({ 'aria-describedby': `complete-${index}` }).simulate('keydown', eventMock)
        popup = wrapper.find(ConsensusPopup)
        expect(eventMock.preventDefault).to.have.been.calledOnce()
        expect(popup.props().active).to.be.true()
        expect(popup.props().line).to.deep.equal(completeLines[index])
        wrapper.instance().close()
        popup = wrapper.find(ConsensusPopup)
        expect(popup.props().active).to.be.false()
        expect(popup.props().line).to.deep.equal({
          consensusText: '',
          textOptions: []
        })
        eventMock.preventDefault.resetHistory()
      })
    })
  })
})
