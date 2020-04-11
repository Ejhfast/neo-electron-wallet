// @flow
import React, { Component } from 'react'
import fs from 'fs'
import storage from 'electron-json-storage'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { recoverWallet } from '../../modules/generateWallet'
import Panel from '../../components/Panel'
import StyledReactSelect from '../../components/Inputs/StyledReactSelect/StyledReactSelect'
import HeaderBar from '../../components/HeaderBar/HeaderBar'
import SettingsItem from '../../components/Settings/SettingsItem'
import SettingsLink from '../../components/Settings/SettingsLink'
import Switch from '../../components/Inputs/Switch'
import {
  DEFAULT_EXPLORER,
  CURRENCIES,
  ROUTES,
  MODAL_TYPES,
  COZ_DONATIONS_ADDRESS,
  DISCORD_INVITE_LINK,
  THEMES,
  LANGUAGES,
  PIPEFY_SUPPORT,
} from '../../core/constants'
import styles from './Settings.scss'
import AddIcon from '../../assets/icons/add.svg'
import LockIcon from '../../assets/icons/lock.svg'
import CurrencyIcon from '../../assets/icons/currency-icon.svg'
import LightbulbIcon from '../../assets/icons/lightbulb-icon.svg'
import CogIcon from '../../assets/icons/cog-icon.svg'
import LangIcon from '../../assets/icons/lang-icon.svg'
import VolumeIcon from '../../assets/icons/volume-icon.svg'
import TimeIcon from '../../assets/icons/time-icon.svg'
import SaveIcon from '../../assets/icons/save-icon.svg'
import pack from '../../../package.json'
import { LanguageSettingsIcon } from '../../components/Inputs/LanguageSelect/LanguageSelect'

const { dialog, shell } = require('electron').remote

type Props = {
  setAccounts: (Array<Object>) => any,
  setCurrency: string => any,
  currency: string,
  setTheme: string => any,
  setLanguageSetting: string => any,
  theme: string,
  showSuccessNotification: Object => any,
  showErrorNotification: Object => any,
  showModal: Function,
  language: string,
  languageDisplayValue: string,
  net: string,
  networkId: string,
  soundEnabled: boolean,
  setSoundSetting: boolean => any,
}

type State = {
  selectedCurrency: SelectOption,
  selectedTheme: SelectOption,
  soundEnabled: boolean,
  selectedLanguage: SelectOption,
}

type Language = {
  label: string,
  value: string,
  renderFlag: () => React$Element<any>,
}

export const loadWalletRecovery = (
  showSuccessNotification: Object => any,
  showErrorNotification: Object => any,
  setAccounts: (Array<Object>) => any,
) => {
  dialog.showOpenDialog(fileNames => {
    // fileNames is an array that contains all the selected
    if (!fileNames) {
      return
    }
    const filepath = fileNames[0]
    fs.readFile(filepath, 'utf-8', (err, data) => {
      if (err) {
        showErrorNotification({
          message: `An error occurred reading the file: ${err.message}`,
        })
        return
      }
      const walletData = JSON.parse(data)

      recoverWallet(walletData)
        .then(data => {
          showSuccessNotification({ message: 'Recovery was successful.' })
          setAccounts(data.accounts)
        })
        .catch(err => {
          showErrorNotification({
            message: `An error occurred recovering wallet: ${err.message}`,
          })
        })
    })
  })
}

export default class Settings extends Component<Props, State> {
  static defaultProps = {
    explorer: DEFAULT_EXPLORER,
  }

  state = {
    selectedCurrency: {
      value: this.props.currency,
      label: this.props.currency.toUpperCase(),
    },
    selectedTheme: {
      value: this.props.theme,
      label: this.props.theme,
    },
    soundEnabled: this.props.soundEnabled,
    selectedLanguage: {
      value: this.props.language,
      label: this.props.languageDisplayValue,
    },
  }

  saveWalletRecovery = () => {
    const { showSuccessNotification, showErrorNotification } = this.props

    storage.get('userWallet', (errorReading, data) => {
      if (errorReading) {
        showErrorNotification({
          message: `An error occurred reading wallet file: ${
            errorReading.message
          }`,
        })
        return
      }
      const content = JSON.stringify(data)
      dialog.showSaveDialog(
        {
          filters: [
            {
              name: 'JSON',
              extensions: ['json'],
            },
          ],
        },
        fileName => {
          if (fileName === undefined) {
            return
          }
          // fileName is a string that contains the path and filename created in the save file dialog.
          fs.writeFile(fileName, content, errorWriting => {
            if (errorWriting) {
              showErrorNotification({
                message: `An error occurred creating the file: ${
                  errorWriting.message
                }`,
              })
            } else {
              showSuccessNotification({
                message: 'The file has been succesfully saved',
              })
            }
          })
        },
      )
    })
  }

  updateCurrencySettings = (option: SelectOption) => {
    this.setState({ selectedCurrency: option })
    const { setCurrency } = this.props
    setCurrency(option.value)
  }

  updateThemeSettings = (option: SelectOption) => {
    this.setState({ selectedTheme: option })
    const { setTheme } = this.props
    setTheme(option.value)
  }

  updateSoundSetting = (soundEnabled: boolean) => {
    this.setState({ soundEnabled })
    const { setSoundSetting } = this.props
    setSoundSetting(soundEnabled)
  }

  updateLanguageSetting = (option: SelectOption) => {
    this.setState({ selectedLanguage: option })
    const { setLanguageSetting } = this.props
    setLanguageSetting(option.value)
  }

  openTokenModal = () => {
    this.props.showModal(MODAL_TYPES.TOKEN)
  }

  render() {
    const {
      showSuccessNotification,
      showErrorNotification,
      setAccounts,
    } = this.props

    const parsedCurrencyOptions = Object.keys(CURRENCIES).map(key => ({
      value: key,
      label: key.toUpperCase(),
    }))
    const parsedThemeOptions = Object.keys(THEMES).map(key => ({
      value: THEMES[key],
      label: THEMES[key],
    }))

    const parsedLangOptions = Object.keys(LANGUAGES).map(key => ({
      value: LANGUAGES[key].value,
      label: LANGUAGES[key].label,
      renderFlag: LANGUAGES[key].renderFlag,
    }))

    const arrOfLanguages: Array<Language> = Object.keys(LANGUAGES).map(
      key => LANGUAGES[key],
    )

    const selectedLang =
      arrOfLanguages.find(
        lang => lang.label === this.state.selectedLanguage.label,
      ) || LANGUAGES.ENGLISH

    return (
      <section className={styles.settingsContainer}>
        <FormattedMessage id="sidebarSettings">
          {t => (
            <HeaderBar
              networkId={this.props.networkId}
              net={this.props.net}
              label={t}
              renderRightContent={this.renderHeaderBarRightContent}
            />
          )}
        </FormattedMessage>
        <Panel
          className={styles.settingsPanel}
          renderHeader={this.renderHeader}
          contentClassName={styles.panelContent}
        >
          <section className={styles.settingsItemsContainer}>
            <div className={styles.innerContainer}>
              <FormattedMessage id="settingsNetworkConfigLabel">
                {translation => (
                  <SettingsLink
                    to={ROUTES.NETWORK_CONFIGURATION}
                    renderIcon={() => <CogIcon />}
                    title={translation}
                  />
                )}
              </FormattedMessage>
              <FormattedMessage id="settingCurrencyLabel">
                {translation => (
                  <SettingsItem
                    renderIcon={() => <CurrencyIcon />}
                    title={translation}
                  >
                    <div className={styles.settingsSelectContainer}>
                      <StyledReactSelect
                        settingsSelect
                        transparent
                        options={parsedCurrencyOptions}
                        value={this.state.selectedCurrency}
                        onChange={this.updateCurrencySettings}
                        isSearchable={false}
                      />
                    </div>
                  </SettingsItem>
                )}
              </FormattedMessage>
              <FormattedMessage id="settingsLanguageLabel">
                {translation => (
                  <SettingsItem
                    renderIcon={() => (
                      <div id={styles.languageSettingsFlagIcon}>
                        {selectedLang.renderFlag()}
                      </div>
                    )}
                    title={translation}
                  >
                    <div className={styles.settingsSelectContainer}>
                      <StyledReactSelect
                        components={{ Option: LanguageSettingsIcon }}
                        settingsSelect
                        onChange={this.updateLanguageSetting}
                        isSearchable={false}
                        transparent
                        options={parsedLangOptions}
                        value={this.state.selectedLanguage}
                      />
                    </div>
                  </SettingsItem>
                )}
              </FormattedMessage>
              <FormattedMessage id="settingsThemeLabel">
                {translation => (
                  <SettingsItem
                    renderIcon={() => <LightbulbIcon />}
                    title={translation}
                  >
                    <div className={styles.settingsSelectContainer}>
                      <StyledReactSelect
                        settingsSelect
                        onChange={this.updateThemeSettings}
                        isSearchable={false}
                        transparent
                        options={parsedThemeOptions}
                        value={this.state.selectedTheme}
                      />
                    </div>
                  </SettingsItem>
                )}
              </FormattedMessage>
              <FormattedMessage id="settingsSoundLabel">
                {translation => (
                  <SettingsItem
                    renderIcon={() => <VolumeIcon />}
                    noBorderBottom
                    title={translation}
                  >
                    <div className={styles.settingsSwitchContainer}>
                      <Switch
                        checked={this.state.soundEnabled}
                        handleCheck={this.updateSoundSetting}
                      />
                    </div>
                  </SettingsItem>
                )}
              </FormattedMessage>
              <div className={styles.settingsSpacer} />

              <FormattedMessage id="settingsEncryptLink">
                {translation => (
                  <SettingsLink
                    renderIcon={() => <LockIcon />}
                    to={ROUTES.ENCRYPT}
                    title={translation}
                  />
                )}
              </FormattedMessage>
              <SettingsLink
                onClick={() =>
                  loadWalletRecovery(
                    showSuccessNotification,
                    showErrorNotification,
                    setAccounts,
                  )
                }
                to={ROUTES.ENCRYPT}
                label={<FormattedMessage id="settingsRecoverWalletLink" />}
                renderIcon={() => <TimeIcon />}
                title={<FormattedMessage id="recoverWallet" />}
              />
              <SettingsLink
                renderIcon={() => <SaveIcon />}
                noBorderBottom
                label={<FormattedMessage id="settingsBackUpLink" />}
                onClick={this.saveWalletRecovery}
                to={ROUTES.NODE_SELECT}
                title={<FormattedMessage id="settingsBackUpLinkLabel" />}
              />
            </div>
            {this.renderDontions()}
          </section>
        </Panel>
      </section>
    )
  }

  renderDontions = () => (
    <Link
      to={{
        pathname: ROUTES.SEND,
        state: { address: COZ_DONATIONS_ADDRESS },
      }}
      className={styles.settingsDonations}
    >
      <FormattedMessage id="settingsDonationLink" /> {COZ_DONATIONS_ADDRESS}
    </Link>
  )

  renderHeaderBarRightContent = () => (
    <div
      onClick={() => this.openTokenModal()}
      className={styles.headerButtonContainer}
    >
      <AddIcon className={styles.add} />
      <span>
        <FormattedMessage id="addToken" />
      </span>
    </div>
  )

  openDiscordLink = () => shell.openExternal(DISCORD_INVITE_LINK)

  openPipefyLink = () => shell.openExternal(PIPEFY_SUPPORT)

  renderHeader = () => (
    <div className={styles.settingsPanelHeader}>
      <div className={styles.settingsPanelHeaderItem}>
        <FormattedMessage id="settingsManageLabel" /> - v{pack.version}
      </div>
      <div className={styles.settingsPanelHeaderItem}>
        <div>
          <FormattedMessage id="settingsCommunity" />:{' '}
          <a onClick={this.openPipefyLink}>{PIPEFY_SUPPORT}</a>
        </div>

        <div>
          NEO Discord:{' '}
          <a onClick={this.openDiscordLink}>{DISCORD_INVITE_LINK}</a>
        </div>
      </div>
    </div>
  )
}
