// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import {
  saveKey,
  resetKey,
  generateWalletFromWif,
  getWif,
  getAddress,
  getEncryptedWif,
  getPassphrase
} from '../../modules/generateWallet'

import EncryptKey from './EncryptKey'

const mapStateToProps = (state: Object) => ({
  wif: getWif(state),
  address: getAddress(state),
  encryptedWif: getEncryptedWif(state),
  passphrase: getPassphrase(state)
})

const actionCreators = {
  saveKey,
  resetKey,
  generateWalletFromWif
}

const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(EncryptKey)
