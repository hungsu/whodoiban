import { createStore } from 'redux'

const state = {
	ajax: false
}

function reducer (state, action) {
    console.log('Old state', state)
    console.log('Action', action)
  switch (action.type) {
    case 'GET_PLAYER_HEROES':
     return Object.assign({}, state, action.data)
    case 'AJAX_START':
     return Object.assign({}, state, { ajax: true })
    case 'AJAX_END':
     return Object.assign({}, state, { ajax: false })
    default:
     return state
  }
}

export default createStore(reducer, state)

