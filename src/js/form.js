import debounce from 'debounce'
import buildTemplate from './buildTemplate'
import store from './store'

var ele = document.getElementById('player-name')

if (ele.addEventListener) {
	ele.addEventListener('submit', getPlayerSuggestions, false) //Modern browsers
	ele.addEventListener('keyup', debounce(getPlayerSuggestions, 500), false) //Modern browsers

	document.getElementById('gamelimit').addEventListener('change', function(event) {
		var gameLimit = this.value
		store.dispatch({
			type: 'GET_PLAYER_HEROES',
			data:{gameLimit: gameLimit}
		})
		getPlayerHeroes()
	})

	document.getElementById('ranked').addEventListener('change', function(event) {
		var gameType = this.value
		store.dispatch({
			type: 'GET_PLAYER_HEROES',
			data: {gameType: gameType}
		})
		getPlayerHeroes()
	})

	document.getElementById('players').addEventListener('click', function(event) {
		let buttonEl = event.target
		if (buttonEl != undefined) {
			let account_id = buttonEl.getAttribute('data-account-id')
			if (account_id.length > 0) {
				document.getElementById('players').innerHTML = ''
				store.dispatch({ 
					type: 'GET_PLAYER_HEROES',
					data: {account_id: parseInt(account_id, 10)}
				})
				window.getAndPrint(store.getState().account_id)
			}
		}
	})
} else if (ele.attachEvent) {
	ele.attachEvent('onsubmit', callback) //Old IE
}

// function 

function getPlayerSuggestions(event) {
	event.preventDefault() // Prevent page reload on submitting form
	let inputEl = event.target
	let userInput = inputEl.value
	let valid = userInput.length > 2 && parseInt(userInput) !== NaN
	if (valid && !store.getState().ajax) {
		store.dispatch({ type: 'AJAX_START' })
		let playersEl = document.getElementById('players')
		playersEl.innerHTML = ''
		playersEl.className = 'loading'
		axios
			.get('https://api.opendota.com/api/search?q=' + userInput)
			.then(function(response) {
				store.dispatch({ type: 'AJAX_END' })
				playersEl.className = ''
				let topResults = response.data.slice(0, 20)
				topResults.forEach(element => {
					let buildPlayerHTML = buildTemplate('t-player')
					let playerHTML = buildPlayerHTML({
						img: '<img src="' + element.avatarfull + '">',
						account_id: element.account_id,
						personaname: element.personaname
					})
					let template = document.getElementById('t-player').innerHTML
					let playerEl = document.createElement('div')
					playerEl.innerHTML = playerHTML
					playersEl.appendChild(playerEl)
				})
			})
	}
}

function getPlayerHeroes() {
	if (store.getState().hasOwnProperty('account_id')) {
		window.getAndPrint(store.getState().account_id)
	}
}