import { SpacedText } from '@zooniverse/react-components'
import { Anchor } from 'grommet'
import Link from 'next/link'
import { withRouter } from 'next/router'
import React from 'react'
import PropTypes from 'prop-types'

import addQueryParams from '@helpers/addQueryParams'


function NavLink ({
  color,
  link,
  router = {},
  StyledAnchor = Anchor,
  StyledSpacedText = SpacedText,
  weight,
  ...anchorProps
}) {
  const { href, text } = link
  const isCurrentPage = router?.asPath === addQueryParams(href, router)
  const { owner, project } = router ? router.query : {}
  const isPFELink = href.startsWith(`/projects/${owner}/${project}/about`)
  const isProductionAPI = process.env.PANOPTES_ENV === 'production'

  const label = <StyledSpacedText children={text} color={color} weight={weight} />

  if (isCurrentPage) {
    return (
      <StyledAnchor color={color} label={label} {...anchorProps} />
    )
  }
  
  if (isPFELink && isProductionAPI) {
    const PFEHref = addQueryParams(`https://www.zooniverse.org${href}`, router)
    return <StyledAnchor color={color} label={label} href={PFEHref} {...anchorProps} />
  }
  
  return (
    <Link href={addQueryParams(href, router)} color={color} passHref>
      <StyledAnchor color={color} label={label} {...anchorProps} />
    </Link>
  )
}

NavLink.propTypes = {
  color: PropTypes.string,
  link: PropTypes.shape({
    as: PropTypes.string,
    href: PropTypes.string,
    text: PropTypes.string
  }).isRequired,
  router: PropTypes.object,
  StyledAnchor: PropTypes.node,
  StyledSpacedText: PropTypes.node,
  weight: PropTypes.string
}

export default withRouter(NavLink)
export { NavLink }
