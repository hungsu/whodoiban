import debounce from 'debounce'
import buildTemplate from './buildTemplate'

var ele = document.getElementById('player')

const state = {
	ajax: false
}

if (ele.addEventListener) {
	ele.addEventListener('submit', getPlayerSuggestions, false) //Modern browsers
	ele.addEventListener('keyup', debounce(getPlayerSuggestions, 500), false) //Modern browsers

	document.getElementById('ranked').addEventListener('change', function(event) {
		console.log(this)
	})

	document.getElementById('players').addEventListener('click', function(event) {
		let buttonEl = event.target
		if (buttonEl != undefined) {
			let account_id = buttonEl.getAttribute('data-account-id')
			if (account_id.length > 0) {
				document.getElementById('players').innerHTML = ''
				window.getAndPrint(account_id)
			}
		}
	})
} else if (ele.attachEvent) {
	ele.attachEvent('onsubmit', callback) //Old IE
}

function getPlayerSuggestions(event) {
	event.preventDefault() // Prevent page reload on submitting form
	let inputEl = event.target
	let userInput = inputEl.value
	let valid = userInput.length > 2 && parseInt(userInput) !== NaN
	if (valid && !state.ajax) {
		state.ajax = true
		let playersEl = document.getElementById('players')
		playersEl.innerHTML = ''
		playersEl.className = 'loading'
		axios
			.get('https://api.opendota.com/api/search?q=' + userInput)
			.then(function(response) {
				state.ajax = false
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