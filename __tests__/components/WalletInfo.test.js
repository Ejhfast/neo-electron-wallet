import React from 'react'
import * as neonjs from 'neon-js'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { merge } from 'lodash'
import { mount, shallow } from 'enzyme'

import { SHOW_NOTIFICATION } from '../../app/modules/notifications'

import { DEFAULT_CURRENCY_CODE, MAIN_NETWORK_ID } from '../../app/core/constants'
import { LOADED } from '../../app/values/state'

import WalletInfo from '../../app/containers/WalletInfo'

// TODO research how to move the axios mock code which is repeated in NetworkSwitch to a helper or config file
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { version } from '../../package.json'

const axiosMock = new MockAdapter(axios)
axiosMock
  .onGet('http://testnet-api.wallet.cityofzion.io/v2/version')
  .reply(200, { version })
axiosMock
  .onGet('https://api.coinmarketcap.com/v1/ticker/?limit=0&convert=USD')
  .reply(200, [{ symbol: 'NEO', price_usd: 24.5 }, { symbol: 'GAS', price_usd: 18.2 }])

jest.mock('electron', () => ({
  app: {
    getPath: () => {
      return 'C:\\tmp\\mock_path'
    }
  }
}))
jest.useFakeTimers()

jest.unmock('qrcode')
import QRCode from 'qrcode/lib/browser' // eslint-disable-line
QRCode.toCanvas = jest.fn()

const initialState = {
  api: {
    NETWORK: {
      batch: false,
      state: LOADED,
      data: MAIN_NETWORK_ID
    },
    ACCOUNT: {
      batch: false,
      state: LOADED,
      data: {
        address: 'ANqUrhv99rwCiFTL6N1An9NH5UVkPYxTuw'
      }
    },
    SETTINGS: {
      batch: false,
      state: LOADED,
      data: {
        currency: DEFAULT_CURRENCY_CODE,
        tokens: []
      }
    },
    PRICES: {
      batch: false,
      state: LOADED,
      data: {
        NEO: 25.48,
        GAS: 18.1
      }
    },
    BALANCES: {
      batch: false,
      state: LOADED,
      data: {
        NEO: '100001',
        GAS: '1000.0001601'
      }
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
  test('renders without crashing', done => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
    done()
  })

  test('correctly renders data from state', done => {
    const { wrapper } = setup(initialState, false)

    const neoWalletValue = wrapper.find('.neoWalletValue')
    const gasWalletValue = wrapper.find('.gasWalletValue')
    const walletValue = wrapper.find('.walletTotal')

    const expectedNeoWalletValue = '2,548,025.48'
    const expectedGasWalletValue = '18,100.00'
    const expectedWalletValue = '2,566,125.48'
    const neoField = wrapper.find('.amountNeo')
    const gasField = wrapper.find('.amountGas')

    expect(neoWalletValue.text()).toEqual(`$${expectedNeoWalletValue} USD`)
    expect(gasWalletValue.text()).toEqual(`$${expectedGasWalletValue} USD`)
    expect(walletValue.text()).toEqual(`Total $${expectedWalletValue} USD`)
    expect(neoField.text()).toEqual('100,001')
    // TODO: Test the GAS tooltip value, this is testing the display value, truncated to 4 decimals
    expect(gasField.text()).toEqual('1,000.0002')
    done()
  })

  test('refreshBalance is getting called on click', async () => {
    const { wrapper, store } = setup(initialState, false)

    wrapper.find('.refreshBalance').simulate('click')

    await Promise.resolve('Pause')
      .then()
      .then()
      .then()
    jest.runAllTimers()

    const action = store.getActions().find((action) => action.type === 'BALANCE/REQ/REQUEST')

    expect(action).toEqual({
      type: 'BALANCE/REQ/REQUEST',
      payload: {
        NEO: '1',
        GAS: '1'
      }
    })
  })

  test('correctly renders data from state with non-default currency', done => {
    const testState = merge(initialState, {
      api: {
        SETTINGS: { data: { currency: 'eur' } },
        PRICES: { data: { NEO: 1.11, GAS: 0.55 } }
      }
    })
    const { wrapper } = setup(testState, false)

    const neoWalletValue = wrapper.find('.neoWalletValue')
    const gasWalletValue = wrapper.find('.gasWalletValue')
    const walletValue = wrapper.find('.walletTotal')

    const expectedNeoWalletValue = '111,001.11'
    const expectedGasWalletValue = '550.00'
    const expectedWalletValue = '111,551.11'

    expect(neoWalletValue.text()).toEqual(`€${expectedNeoWalletValue} EUR`)
    expect(gasWalletValue.text()).toEqual(`€${expectedGasWalletValue} EUR`)
    expect(walletValue.text()).toEqual(`Total €${expectedWalletValue} EUR`)

    done()
  })

  test('network error is shown with connectivity error', async () => {
    neonjs.api.neonDB.getBalance = jest.fn(() => {
      return new Promise((resolve, reject) => {
        reject(new Error())
      })
    })
    const { wrapper, store } = setup(initialState, false)
    wrapper.find('.refreshBalance').simulate('click')

    jest.runAllTimers()
    await Promise.resolve('Pause')
      .then()
      .then()
      .then()
      .then()

    const actions = store.getActions()
    const notifications = []
    actions.forEach(action => {
      if (action.type === SHOW_NOTIFICATION) {
        notifications.push(action)
      }
    })

    // let's make sure the last notification show was an error.
    expect(notifications.pop().payload.level).toEqual('error')
  })
})
