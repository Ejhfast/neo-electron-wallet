import { compose } from 'recompose'
import { values, omit } from 'lodash'
import { withData } from 'spunky'
import Send from './Send'

import withNetworkData from '../../hocs/withNetworkData'
import withAuthData from '../../hocs/withAuthData'
import withBalancesData from '../../hocs/withBalancesData'
import withCurrencyData from '../../hocs/withCurrencyData'
import withFilteredTokensData from '../../hocs/withFilteredTokensData'
import contactsActions from '../../actions/contactsActions'

const filterSendableAssets = balances => {
  const sendableAssets = {}
  if (Number(balances.NEO > 0)) {
    sendableAssets.NEO = { symbol: 'NEO', balance: balances.NEO }
  }

  if (Number(balances.GAS > 0)) {
    sendableAssets.GAS = { symbol: 'GAS', balance: balances.NEO }
  }

  values(omit(balances, 'NEO', 'GAS'))
    .filter(token => token.balance > 0)
    .forEach(token => {
      sendableAssets[token.symbol] = {
        symbol: token.symbol,
        balance: token.balance
      }
    })

  return sendableAssets
}

const mapContactsDataToProps = (contacts: Object) => ({ contacts })

const mapBalanceDataToProps = balances => ({
  NEO: balances.NEO,
  GAS: balances.GAS,
  tokenBalances: values(omit(balances, 'NEO', 'GAS')),
  sendableAssets: filterSendableAssets(balances)
})

export default compose(
  withBalancesData(mapBalanceDataToProps),
  withCurrencyData('currencyCode'),
  withData(contactsActions, mapContactsDataToProps),
  withNetworkData(),
  withAuthData(),
  withFilteredTokensData()
)(Send)