import { WorkflowFactory } from '@test/factories'
import { Factory } from 'rosie'
import sinon from 'sinon'
import RootStore from '../RootStore'
import Workflow from './Workflow'

import { MultipleChoiceTaskFactory } from '@test/factories'

describe('Model > Workflow', function () {
  it('should exist', function () {
    expect(Workflow).to.be.an('object')
  })

  describe('default settings', function () {
    let workflow

    before(function () {
      const workflowSnapshot = WorkflowFactory.build({
        id: 'workflow1',
        display_name: 'A test workflow',
        version: '0.0'
      })
      workflow = Workflow.create(workflowSnapshot)
    })

    it('should not be grouped', function () {
      expect(workflow.grouped).to.be.false()
    })

    it('should not use transcription task', function () {
      expect(workflow.usesTranscriptionTask).to.be.false()
    })
  })

  describe('workflow steps', function () {
    let step
    const task = MultipleChoiceTaskFactory.build({ taskKey: 'T1' })

    before(function () {
      step = {
        stepKey: 'S1',
        taskKeys: ['T1'],
        tasks: [task]
      }
    })

    it('should be of the form [stepKey, step]', function (){
      const { stepKey } = step
      const workflowSnapshot = WorkflowFactory.build({
        id: 'workflow1',
        display_name: 'A test workflow',
        steps: [
          [ stepKey, step ]
        ],
        tasks: {
          T1: task
        },
        version: '0.0'
      })
      const workflow = Workflow.create(workflowSnapshot)
      expect(workflow.steps[0]).to.deep.equal([ stepKey, step ])
    })

    it('should not be of the form [step, stepKey]', function (){
      function createWorkflow() {
        const { stepKey } = step
        const workflowSnapshot = WorkflowFactory.build({
          id: 'workflow1',
          display_name: 'A test workflow',
          steps: [
            [ step, stepKey ]
          ],
          tasks: {
            T1: task
          },
          version: '0.0'
        })
        const workflow = Workflow.create(workflowSnapshot)
      }
      expect(createWorkflow).to.throw()
    })
  })

  describe('with transcription task', function () {
    let workflow

    before(function () {
      const workflowSnapshot = WorkflowFactory.build({
        id: 'workflow1',
        display_name: 'A test workflow',
        tasks: {
          T0: {
            type: 'transcription',
            tools: [
              { type: 'transcriptionLine' }
            ]
          },
          T1: {
            answers: [{ label: "Enter an answer" }, { label: "Enter an answer" }],
            type: 'single',
            question: 'is it done?'
          }
        },
        version: '0.0'
      })
      workflow = Workflow.create(workflowSnapshot)
    })

    it('should use transcription task', function () {
      expect(workflow.usesTranscriptionTask).to.be.true()
    })
  })

  describe('Actions > selectSubjectSet', function () {
    let rootStore
    let workflow

    beforeEach(function () {
      rootStore = RootStore.create();
      const subjectSets = Factory.buildList('subject_set', 5)
      rootStore.subjectSets.setResources(subjectSets)
      const workflowSnapshot = WorkflowFactory.build({
        id: 'workflow1',
        display_name: 'A test workflow',
        links: {
          subject_sets: subjectSets.map(subjectSet => subjectSet.id)
        },
        version: '0.0'
      })
      workflow = Workflow.create(workflowSnapshot)
      rootStore.workflows.setResources([workflow])
    })

    describe('with a valid subject set', function () {

      it('should select the subject set', async function () {
        expect(workflow.subjectSetId).to.be.undefined()
        const subjectSetID = workflow.links.subject_sets[1]
        const subjectSet = await workflow.selectSubjectSet(subjectSetID)
        expect(subjectSet.id).to.equal(subjectSetID)
      })
    })

    describe('with an invalid subject set', function () {

      it('should throw an error', async function () {
        let errorThrown = false
        sinon.stub(rootStore.subjectSets, 'fetchResource').callsFake(async () => undefined)
        expect(workflow.subjectSetId).to.be.undefined()
        try {
          const subjectSet = await workflow.selectSubjectSet('abcdefg')
        } catch (e) {
          errorThrown= true
          expect(e.message).to.equal('No subject set abcdefg for workflow workflow1')
        }
        expect(errorThrown).to.be.true()
        rootStore.subjectSets.fetchResource.restore()
      })
    })
  })

  describe('Views > subjectSetId', function () {
    let rootStore
    let workflow

    beforeEach(function () {
      rootStore = RootStore.create();
      const subjectSets = Factory.buildList('subject_set', 5)
      rootStore.subjectSets.setResources(subjectSets)
      const workflowSnapshot = WorkflowFactory.build({
        id: 'workflow1',
        display_name: 'A test workflow',
        links: {
          subject_sets: subjectSets.map(subjectSet => subjectSet.id)
        },
        version: '0.0'
      })
      workflow = Workflow.create(workflowSnapshot)
      rootStore.workflows.setResources([workflow])
    })

    describe('with no selected subject set', function () {

      it('should be undefined', async function () {
        expect(workflow.subjectSetId).to.be.undefined()
      })
    })

    describe('with a selected subject set', function () {

      it('should return the selected subject set ID', async function () {
        expect(workflow.subjectSetId).to.be.undefined()
        const subjectSetID = workflow.links.subject_sets[1]
        await workflow.selectSubjectSet(subjectSetID)
        expect(workflow.subjectSetId).to.equal(subjectSetID)
      })
    })

    describe('with an invalid subject set', function () {

      it('should error', async function () {
        let errorThrown = false
        sinon.stub(rootStore.subjectSets, 'fetchResource').callsFake(async () => undefined)
        expect(workflow.subjectSetId).to.be.undefined()
        try {
          await workflow.selectSubjectSet('abcdefg')
        } catch (e) {
          errorThrown = true
          expect(e.message).to.equal('No subject set abcdefg for workflow workflow1')
        }
        expect(errorThrown).to.be.true()
        rootStore.subjectSets.fetchResource.restore()
      })
    })
  })
})
