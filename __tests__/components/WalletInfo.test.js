import React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { mount, shallow } from 'enzyme'
import { SET_TRANSACTION_HISTORY, SET_BALANCE, SET_IS_LOADED } from '../../app/modules/wallet'
import { SHOW_NOTIFICATION, HIDE_NOTIFICATIONS, DEFAULT_POSITION } from '../../app/modules/notifications'
import { LOADING_TRANSACTIONS } from '../../app/modules/transactions'
import { SET_HEIGHT } from '../../app/modules/metadata'
import { NOTIFICATION_LEVELS } from '../../app/core/constants'
import WalletInfo from '../../app/containers/WalletInfo'
import * as neonjs from 'neon-js'

// TODO research how to move the axios mock code which is repeated in NetworkSwitch to a helper or config file
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { version } from '../../package.json'

const axiosMock = new MockAdapter(axios)
axiosMock
  .onGet('http://testnet-api.wallet.cityofzion.io/v2/version')
  .reply(200, { version })
axiosMock
  .onGet('https://api.coinmarketcap.com/v1/ticker/neo/?convert=USD')
  .reply(200, [ { price_usd: 24.50 } ])
axiosMock
  .onGet('https://api.coinmarketcap.com/v1/ticker/gas/?convert=USD')
  .reply(200, [ { price_usd: 18.20 } ])

jest.mock('electron', () => ({
  clipboard: {
    writeText: jest.fn()
  }
}))
jest.useFakeTimers()

jest.unmock('qrcode')
import QRCode from 'qrcode/lib/browser' // eslint-disable-line
QRCode.toCanvas = jest.fn()

const initialState = {
  account: {
    address: 'ANqUrhv99rwCiFTL6N1An9NH5UVkPYxTuw'
  },
  metadata: {
    network: 'TestNet'
  },
  wallet: {
    NEO: 100001,
    GAS: 1.0001601,
    prices: {
      NEO: 25.48,
      GAS: 18.10
    }
  },
  claim: {
    claimAmount: 0.5
  }
}

const setup = (state = initialState, shallowRender = true) => {
  const store = configureStore([thunk])(state)

  let wrapper
  if (shallowRender) {
    wrapper = shallow(<WalletInfo store={store} />)
  } else {
    wrapper = mount(
      <Provider store={store}>
        <WalletInfo />
      </Provider>
    )
  }

  return {
    store,
    wrapper
  }
}

describe('WalletInfo', () => {
  test('renders without crashing', (done) => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
    done()
  })
  test('correctly renders data from state', (done) => {
    const { wrapper } = setup(initialState, false)

    const neoWalletValue = wrapper.find('.neoWalletValue')
    const gasWalletValue = wrapper.find('.gasWalletValue')
    const walletValue = wrapper.find('.walletTotal')

    const expectedNeoWalletValue = '2,548,025.48'
    const expectedGasWalletValue = '18.10'
    const expectedWalletValue = '2,548,043.58'
    const neoField = wrapper.find('.amountNeo')
    const gasField = wrapper.find('.amountGas')

    expect(neoWalletValue.text()).toEqual(`US $${expectedNeoWalletValue}`)
    expect(gasWalletValue.text()).toEqual(`US $${expectedGasWalletValue}`)
    expect(walletValue.text()).toEqual(`Total US $${expectedWalletValue}`)
    expect(neoField.text()).toEqual(`${initialState.wallet.NEO}`)
    // TODO: Test the gas tooltip value, this is testing the display value, truncated to 4 decimals
    expect(gasField.text()).toEqual('1.0001')
    done()
  })
  test('refreshBalance is getting called on click', async () => {
    const { wrapper, store } = setup()
    const deepWrapper = wrapper.dive()

    deepWrapper.find('.refreshBalance').simulate('click')
    jest.runAllTimers()
    await Promise.resolve('Pause').then().then().then().then()
    const actions = store.getActions()
    expect(actions.length).toEqual(8)
    expect(actions[0]).toEqual({
      type: LOADING_TRANSACTIONS,
      payload: {
        isLoadingTransactions: true
      }
    })
    expect(actions[1]).toEqual({
      type: LOADING_TRANSACTIONS,
      payload: {
        isLoadingTransactions: false
      }
    })
    expect(actions[2]).toEqual({
      type: SET_TRANSACTION_HISTORY,
      payload: {
        transactions: []
      }
    })
    expect(actions[3]).toEqual({
      type: SET_HEIGHT,
      payload: {
        blockHeight: 586435
      }
    })
    expect(actions[4]).toEqual({
      type: SET_IS_LOADED,
      payload: {
        loaded: true
      }
    })
    expect(actions[5]).toEqual({
      type: SET_BALANCE,
      payload: {
        NEO: 1,
        GAS: 1
      }
    })
    expect(actions[6]).toEqual({
      type: HIDE_NOTIFICATIONS,
      payload: {
        dismissible: true,
        position: DEFAULT_POSITION
      }
    })
    expect(actions[7]).toEqual({
      type: SHOW_NOTIFICATION,
      payload: expect.objectContaining({
        message: 'Received latest blockchain information.',
        level: NOTIFICATION_LEVELS.SUCCESS
      })
    })
  })
  test('network error is shown with connectivity error', async () => {
    neonjs.api.neonDB.getBalance = jest.fn(() => {
      return new Promise((resolve, reject) => {
        reject(new Error())
      })
    })
    const { wrapper, store } = setup()
    wrapper.dive().find('.refreshBalance').simulate('click')

    jest.runAllTimers()
    await Promise.resolve('Pause').then().then().then().then()

    const actions = store.getActions()
    let notifications = []
    actions.forEach(action => {
      if (action.type === SHOW_NOTIFICATION) {
        notifications.push(action)
      }
    })

    // let's make sure the last notification show was an error.
    expect(notifications.pop().payload.level).toEqual('error')
  })
})
