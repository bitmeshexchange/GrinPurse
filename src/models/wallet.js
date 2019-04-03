'use strict';
import ws from '../common/ws';
import eventBus from 'src/common/eventBus';
import { routerRedux } from 'dva/router';
import logo from 'src/assets/wallet/logo.png'
const scale = 1e9;

const BN = require('bignumber.js');

function sleep() {
  return new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });
}

export default {
  namespace: 'wallet',
  state: {
    connected: false,
    address: '',
    receiving: 0,
    spendable: 0,
    total: 0,
    sending: 0,
    peer_count: 0,
    current_height: 0,
    block_height: 0,
    transactions: [],
    exchange: {},
  },

  subscriptions: {
    async init({ dispatch }) {

      eventBus.on('network_connected', () => {
        dispatch({
          type: 'save',
          payload: {
            connected: true
          }
        })
      })

      eventBus.on('network_disconnected', () => {
        dispatch({
          type: 'save',
          payload: {
            connected: false
          }
        })
      })

      ws.on('status', data => {
        dispatch({
          type: 'save',
          payload: data,
        });
      });

      ws.on('log', data => {
        console.log(data)
      });


      // const amount = 1, address = '111';


      ws.on('receiving', ({ amount, address }) => {
        dispatch({
          type: 'fetchTransactions'
        });
        const notification = {
          title: 'Grin Purse',
          body: `You're receiving ${amount} grin`,
          icon: logo,
        }
        const myNotification = new window.Notification(notification.title, notification);
        myNotification.onclick = () => {
          dispatch(routerRedux.replace({
            pathname: 'home',
          }));
        }
      })

      ws.on('balance', balance => {
        if (!balance) {
          return;
        }
        const {total, amount_currently_spendable, amount_locked} = balance;
        dispatch({
          type: 'save',
          payload: {
            total: BN(total).div(1e9).toString(),
            spendable: BN(amount_currently_spendable).div(1e9).toString(),
            lock: BN(amount_locked).div(1e9).toString(),
          }
        });
      });

      setInterval(() => {
        dispatch({
          type: 'fetchTransactions',
        })
      }, 10 * 1e3);
    }
  },

  effects: {
    *fetchBalance({payload}, {call, put}) {
      const res = yield ws.queryBalance();
      const {total, amount_currently_spendable, amount_locked} = res.data;
      yield put({
        type: 'save',
        payload: {
          total: BN(total).div(1e9).toString(),
          spendable: BN(amount_currently_spendable).div(1e9).toString(),
          lock: BN(amount_locked).div(1e9).toString(),
        },
      });
    },

    *fetchTransactions({payload}, {call, put}) {
      let res = yield ws.queryTransactions();
      if (res.success) {
        let txs = res.data;
        if (txs && txs.length) {
          txs = txs.sort((b, a) => {
            return a.id - b.id;
          });
        }
        let receiving = BN(0), sending = BN(0);
        txs.forEach(item => {
          const {amount_credited, amount_debited, confirmed, tx_type } = item;
          if (!item.confirmed) {
            let amount = amount_credited - amount_debited;
            amount = BN(amount).div(scale)
            if (tx_type === 'TxReceived') {
              receiving = amount.plus(receiving);
            } else if (tx_type === 'TxSent') {
              sending = amount.plus(sending);
            }
          }
        })
        yield put({
          type: 'save',
          payload: {
            transactions: txs,
            receiving: receiving.toString(),
            sending: sending.toString()
          },
        });
      }
    },

    *fetchAddress({payload}, {call, put}) {
      const res = yield ws.getAddress();
      yield put({
        type: 'save',
        payload: {
          address: res.data,
        },
      });
    },

    *fetchExchange({ payload }, {call, put}) {
      const res = yield ws.fetchExchange();
      yield put({
        type: 'save',
        payload: {
          exchange: res.data,
        },
      });
    },

    *transfer({payload}, {call, put}) {
      return yield ws.transfer(payload);
    },

    *check({payload}, {call, put}) {
      return yield ws.checkWallet();
    },

    *createWallet({payload}, {call, put}) {
      return yield ws.createWallet(payload);
    },
    *queryWallet({payload}, {call, put}) {
      return yield ws.queryWallet(payload);
    },
    *login({payload}, {call, put}) {
      return yield ws.login(payload);
    },
    *createMnemonic({payload}, {call, put}) {
      return yield ws.createMnemonic(payload);
    },
    *importWallet({payload}, {call, put}) {
      return yield ws.importWallet(payload);
    },
    *cancelTx({payload}, {call, put}) {
      return yield ws.cancelTx(payload);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  }
}
