import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'

import SurveyTask from './SurveyTask'

class SurveyTaskContainer extends React.Component {
  constructor () {
    super()

    this.state = {
      answers: {},
      filters: {},
      selectedChoice: ''
    }
  }

  componentDidUpdate (prevProps) {
    const { task } = this.props
    const prevTaskKey = prevProps.task?.taskKey
    const taskChanged = task && (task.taskKey !== prevTaskKey)

    if (taskChanged) {
      this.handleReset()
    }
  }

  handleAnswers (answers) {
    this.setState({ answers })
  }

  handleChoice (selectedChoice) {
    const { annotation } = this.props

    if (annotation?.value?.map(item => item.choice).includes(selectedChoice)) {
      const existingAnnotationValue = annotation?.value?.find(value => value.choice === selectedChoice)
      this.setState({ selectedChoice, answers: existingAnnotationValue.answers })
    } else {
      this.setState({ selectedChoice })
    }
  }

  handleFilter (characteristicId, valueId) {
    let newFilters = Object.assign({}, this.state.filters)
    if (valueId) {
      newFilters[characteristicId] = valueId
    } else if (characteristicId) {
      delete newFilters[characteristicId]
    } else {
      newFilters = {}
    }
    this.setState({ filters: newFilters })
  }

  handleIdentify() {
    const { annotation } = this.props
    const { answers, filters, selectedChoice } = this.state

    const parsedFilters = JSON.parse(JSON.stringify(filters))
    const value = annotation?.value?.filter(item => item.choice !== selectedChoice) || []
    value.push({ choice: selectedChoice, answers, filters: parsedFilters })

    this.setState({
      answers: {},
      selectedChoice: ''
    })

    annotation.update(value)
  }

  handleReset() {
    this.setState({
      answers: {},
      filters: {},
      selectedChoice: ''
    })
  }

  render () {
    const {
      annotation,
      autoFocus,
      disabled,
      task
    } = this.props

    const {
      answers,
      filters,
      selectedChoice
    } = this.state

    const selectedChoiceIds = annotation?.value?.map(item => item.choice)

    return (
      <SurveyTask
        answers={answers}
        autoFocus={autoFocus}
        disabled={disabled}
        filters={filters}
        handleAnswers={this.handleAnswers.bind(this)}
        handleChoice={this.handleChoice.bind(this)}
        handleFilter={this.handleFilter.bind(this)}
        handleIdentify={this.handleIdentify.bind(this)}
        selectedChoice={selectedChoice}
        selectedChoiceIds={selectedChoiceIds}
        task={task}
      />
    )
  }
}

SurveyTaskContainer.defaultProps = {
  autoFocus: false,
  disabled: false
}

SurveyTaskContainer.propTypes = {
  autoFocus: PropTypes.bool,
  annotation: PropTypes.shape({
    update: PropTypes.func,
    value: PropTypes.array
  }).isRequired,
  disabled: PropTypes.bool,
  task: PropTypes.shape({
    help: PropTypes.string,
    required: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    taskKey: PropTypes.string,
    type: PropTypes.string
  }).isRequired
}

@observer
class DecoratedSurveyTaskContainer extends SurveyTaskContainer { }

export {
  DecoratedSurveyTaskContainer as default,
  SurveyTaskContainer
}
