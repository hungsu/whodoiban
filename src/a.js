import getPlayerHeroData from './js/getPlayerHeroData'
import getHeroImpact from './js/getHeroImpact'
import getHeroName from './js/getHeroName'
import debounce from 'debounce'
import buildTemplate from './js/buildTemplate'

var ele = document.getElementById('player')

if (ele.addEventListener) {
	ele.addEventListener('submit', getPlayerSuggestions, false) //Modern browsers
	ele.addEventListener('keyup', debounce(getPlayerSuggestions, 500), false) //Modern browsers
	// document.getElementById('players').addEventListener('click', useSuggestion)

	document
		.getElementById('players')
		.addEventListener('click', function(event) {
			let buttonEl = event.path.reduce(function(accumulator, current){
				console.log(accumulator.tagName, current.tagName)
				if (current.tagName && current.tagName.toLowerCase() == 'button') {
					return current
				} else {
					return accumulator
				}
			})
			console.log(buttonEl)
			if (buttonEl != undefined) {
				let account_id = buttonEl.getAttribute('data-account-id')
				if (account_id.length > 0) {
					document.getElementById('players').innerHTML = ''
					getAndPrint(account_id)
				}
			}
		})


} else if (ele.attachEvent) {
	ele.attachEvent('onsubmit', callback) //Old IE
}

function useSuggestion(event){
	event.preventDefault()
	console.log(event)
	console.log(this)
	let account_id = event.currentTarget.getAttribute('data-account-id')
	if (account_id.length > 0) {
		document.getElementById('players').innerHTML = ''
		getAndPrint(account_id)
	}
}

function getPlayerSuggestions(event) {
	event.preventDefault() // Prevent page reload on submitting form
	let inputEl = event.target
	let userInput = inputEl.value
	let valid = userInput.length > 2 && parseInt(userInput) !== NaN
	if (valid) {
		document.getElementById('players').innerHTML = 'Loading'
		axios
			.get('https://api.opendota.com/api/search?q=' + userInput)
			.then(function(response) {
				let playersEl = document.getElementById('players')
				playersEl.innerHTML = ''
				let topResults = response.data.slice(0, 9)
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

function getAndPrint(account_id) {
	let playerId = parseInt(account_id, 10)
	if (playerId > 0) {
		let options = { limit: 100 }
		document.getElementById('summary').innerHTML = 'Loading'
		document.getElementById('suggestions').innerHTML = ''
		getPlayerHeroData(playerId, options).then(function(values) {
			let player = values[2].data.profile
			player.wins = values[1].data.win
			player.losses = values[1].data.lose,
			player.games = values[1].data.win + values[1].data.lose
			
			let heroesWithChanges = values[0].data.map(element => {
				let heroName = getHeroName(parseInt(element.hero_id, 10))
				let hero = Object.assign(
					{ heroName: heroName, impact: getHeroImpact(player, element) },
					element
				)
				return hero
			})
			heroesWithChanges.sort((a, b) => {
				return b.impact.all - a.impact.all
			})
			let winrate = (player.wins / player.games * 100).toFixed(3)
			let summaryTemplate = buildTemplate('t-summary')
			let outputHtml = summaryTemplate({
				img: '<img src="' + player.avatarfull + '">',
				name: player.personaname,
				games: options.limit,
				winrate: winrate
			})
			document.getElementById('summary').innerHTML = outputHtml
			document.getElementById('suggestions').innerHTML = ''
			printHero(heroesWithChanges[0], player)
			printHero(heroesWithChanges[1], player)
			printHero(heroesWithChanges[2], player)
			printHero(heroesWithChanges[3], player)
			printHero(heroesWithChanges[4], player)
		})
	}
}

function printHero(hero, player) {
	let winrate = player.wins / player.games * 100
	let change = hero.impact.all * 100
	let greatestImpact = Math.min(
		hero.impact.against,
		hero.impact.with,
		hero.impact.me
	)
	let reason = ''
	if (greatestImpact == hero.impact.against) {
		reason = hero.heroName + ' on the enemy team.'
	} else if (greatestImpact == hero.impact.with) {
		reason = 'an ally on your team playing ' + hero.heroName
	} else if (greatestImpact == hero.impact.me) {
		reason = 'your own play with ' + hero.heroName
	}
	let heroFileName = hero.heroName
		.replace(' ', '_')
		.replace("'", '')
		.toLowerCase()
	let templateHtml = document.getElementById('t-suggestion').innerHTML
	let outputHtml = templateHtml
		.split('${heroFileName}')
		.join(heroFileName)
		.split('${heroName}')
		.join(hero.heroName)
		.split('${change}')
		.join(change.toFixed(3))
		.split('${newWinrate}')
		.join((winrate + change).toFixed(3))
		.split('${as}')
		.join(hero.win + '/' + hero.games)
		.split('${with}')
		.join(hero.with_win + '/' + hero.with_games)
		.split('${against}')
		.join(hero.against_win + '/' + hero.against_games)
		.split('${reason}')
		.join(reason)
	let suggestionEl = document.createElement('div')
	suggestionEl.innerHTML = outputHtml
	document.getElementById('suggestions').appendChild(suggestionEl)
}
