import React from 'react'
import { MobXProviderContext, observer } from 'mobx-react'
import FieldGuideWrapper from './FieldGuideWrapper'

function useStores() {
  const stores = React.useContext(MobXProviderContext)

  const { 
    active: fieldGuide,
    attachedMedia: icons,
    activeItemIndex,
    setActiveItemIndex,
    setModalVisibility,
    showModal
  } = stores.classifierStore.fieldGuide

  return {
    activeItemIndex,
    fieldGuide,
    icons,
    setActiveItemIndex,
    setModalVisibility,
    showModal
  }
}

function FieldGuideConnector(props) {
  const {
    activeItemIndex,
    fieldGuide,
    icons,
    setActiveItemIndex,
    setModalVisibility,
    showModal
  } = useStores()

  return (
    <FieldGuideWrapper
      activeItemIndex={activeItemIndex}
      fieldGuide={fieldGuide}
      icons={icons}
      setActiveItemIndex={setActiveItemIndex}
      setModalVisibility={setModalVisibility}
      showModal={showModal}
      {...props}
    />
  )
}

export default observer(FieldGuideConnector)