import React, { Component } from 'react'

import RefreshIcon from '../../../assets/icons/refresh.svg'

import styles from './SendPageHeader.scss'

class SendPageHeader extends Component {
  render() {
    return (
      <section className={styles.sendPageHeader}>
        <h1 className={styles.sendPageHeading}>Send Assets</h1>
        <button className={styles.sendPageHeaderRefreshButton} type="button">
          <RefreshIcon className={styles.sendPageHeaderRefreshIcon} />Refresh
        </button>
      </section>
    )
  }
}

export default SendPageHeader
