import getPlayerHeroData from './js/getPlayerHeroData'
import getHeroImpact from './js/getHeroImpact'
import getHeroName from './js/getHeroName'
import debounce from 'debounce'

var ele = document.getElementById('player')

if (ele.addEventListener) {
	ele.addEventListener('submit', getAndPrint, false) //Modern browsers
	ele.addEventListener('keyup', debounce(getPlayerIdFromString, 500), false) //Modern browsers
} else if (ele.attachEvent) {
	ele.attachEvent('onsubmit', callback) //Old IE
}

function getPlayerIdFromString(event) {
	let inputEl = event.target
	let userInput = inputEl.value
	let valid = (userInput.length > 2) && (parseInt(userInput) !== NaN)
	if (valid) {
		axios
			.get('https://api.opendota.com/api/search?q=' + userInput)
			.then(function(response) {
				console.log(response.data)
				inputEl.value = response.data[0].account_id
			})
	}
}

function getAndPrint(event) {
	event.preventDefault()
	let playerId = parseInt(event.target[0].value, 10)
	if (playerId > 0) {
		let options = { limit: 100 }
		getPlayerHeroData(playerId, options).then(function(values) {
			let player = { personaname: values[2].data.profile.personaname, avatarfull: values[2].data.profile.avatarfull, wins: values[1].data.win, losses: values[1].data.lose, games: values[1].data.win + values[1].data.lose }
			let heroesWithChanges = values[0].data.map(element => {
				let heroName = getHeroName(parseInt(element.hero_id, 10))
				let hero = Object.assign({ heroName: heroName, impact: getHeroImpact(player, element) }, element)
				return hero
			})
			heroesWithChanges.sort((a, b) => {
				return b.impact.all - a.impact.all
			})
			let winrate = player.wins / player.games * 100
			let template = document.getElementById('t-summary').innerHTML
			let outputHtml = template
				.split('${name}')
				.join(player.personaname)
				.split('${games}')
				.join(options.limit)
				.split('${winrate}')
				.join(winrate.toFixed(3))
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

function render(){

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
	let templateHtml = document.getElementById('t-suggestion').innerHTML
	let outputHtml = templateHtml
		.split('${heroFileName}')
		.join(hero.heroName.split(' ').join('_').toLowerCase())
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