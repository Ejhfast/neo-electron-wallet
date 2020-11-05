// @flow
import React from 'react'
import { Link } from 'react-router-dom'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { FormattedMessage } from 'react-intl'

import LoginPrivateKey from '../LoginPrivateKey'
import LoginNep2 from '../LoginNep2'
import LoginLedgerNanoS from '../LoginLedgerNanoS'
import LoginLocalStorage from '../LoginLocalStorage'
import LoginWatchOnly from '../LoginWatchOnly'
import Button from '../../components/Button'
import styles from './Home.scss'
import AddIcon from '../../assets/icons/add.svg'
import ImportIcon from '../../assets/icons/import.svg'
import { ROUTES } from '../../core/constants'
import HomeLayout from './HomeLayout'
import pack from '../../../package.json'

type State = {
  tabIndex: number,
}
type Props = {
  loading: boolean,
  theme: ThemeType,
}

const LOGIN_OPTIONS = {
  LOCAL_STORAGE: {
    render: () => <LoginLocalStorage />,
    displayKey: 'Saved',
    renderDisplayMessage: () => <FormattedMessage id="authSaved" />,
  },
  PRIVATE_KEY: {
    render: () => <LoginPrivateKey />,
    displayKey: 'Private',
    renderDisplayMessage: () => <FormattedMessage id="authPrivate" />,
  },
  NEP2: {
    render: () => <LoginNep2 />,
    displayKey: 'Encrypted',
    renderDisplayMessage: () => <FormattedMessage id="authEncrypted" />,
  },
  watch: {
    render: () => <LoginWatchOnly />,
    displayKey: 'Watch',
    renderDisplayMessage: () => <FormattedMessage id="authWatch" />,
  },
  ledger: {
    render: () => <LoginLedgerNanoS />,
    displayKey: 'Ledger',
    renderDisplayMessage: () => <FormattedMessage id="authLedger" />,
  },
}

export default class Home extends React.Component<Props, State> {
  state = {
    tabIndex: 0,
  }

  // $FlowFixMe
  options = Object.keys(LOGIN_OPTIONS).map((key: string) => LOGIN_OPTIONS[key])

  render = () => {
    const { loading, theme } = this.props
    return (
      <HomeLayout theme={theme}>
        <div className={styles.inputContainer}>
          <Tabs
            selectedIndex={this.state.tabIndex}
            onSelect={tabIndex => this.setState({ tabIndex })}
            className="neon-tabs"
          >
            <TabList>
              {this.options.map(option => (
                <Tab key={option.displayKey}>
                  {option.renderDisplayMessage()}
                </Tab>
              ))}
            </TabList>
            <div className={styles.loginContentContainer}>
              {this.options.map(option => (
                <TabPanel
                  key={option.displayKey}
                  selectedClassName={styles.homeTabPanel}
                >
                  {option.render()}
                </TabPanel>
              ))}
            </div>
          </Tabs>
          <div className={styles.buttonRow}>
            <div className={styles.buttonContainer}>
              <Link to={ROUTES.CREATE_WALLET}>
                <Button elevated disabled={loading} renderIcon={AddIcon}>
                  <FormattedMessage id="authCreateWallet" />
                </Button>
              </Link>
            </div>
            <div className={styles.buttonContainer}>
              <Link to={ROUTES.IMPORT_WALLET}>
                <Button elevated disabled={loading} renderIcon={ImportIcon}>
                  <FormattedMessage id="authImportWallet" />
                </Button>
              </Link>
            </div>
          </div>
          <div className={styles.versionNumber}>{`v${pack.version}`}</div>
        </div>
      </HomeLayout>
    )
  }
}
