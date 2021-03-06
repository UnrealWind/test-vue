import Vue from 'vue'
import Vuex from 'vuex'
import { tkParse } from '@moke/vue-tk'
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    sessionToken: null,
    user: null,
    cart: {}
  },
  getters: {
    getState: state => {
      return state
    }
  },
  mutations: {
    setSessionToken (state, sessionToken) {
      state.sessionToken = sessionToken
      tkParse.setSessionToken(sessionToken)
    },
    setUser (state, user) {
      state.user = user
    },

    // 这里购物车的数据需要按照之前做一下适配然后存起来，为了方便获取使用objectId作为key
    setCart (state, cart) {
      !state.cart[cart.shopId] ? state.cart[cart.shopId] = [cart] : (() => {
        let has
        state.cart[cart.shopId].forEach(function (n, i) {
          if (n.objectId === cart.objectId) {
            n.quantity += cart.quantity
            has = true
          }
        })
        if (!has) {
          state.cart[cart.shopId].push(cart)
        }
      })()
    },

    // 改变单一一条数据
    add (state, msg) {
      state.user[msg.key] = msg.value
    },
    resetCart (state, cart) {
      state.cart = cart
    },
    initFromStorage (state, opt) {
      for (let i in opt) {
        state[i] = opt[i]
      }
    }
  },
  actions: {}
})
export default store
