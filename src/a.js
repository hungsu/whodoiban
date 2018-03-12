import getPlayerHeroData from './js/getPlayerHeroData'
import getHeroImpact from './js/getHeroImpact'
import getHeroName from './js/getHeroName'

var ele = document.getElementById('player')
if (ele.addEventListener) {
	ele.addEventListener('submit', getAndPrint, false) //Modern browsers
	ele.addEventListener('keyup', getPlayerIdFromString, false) //Modern browsers
} else if (ele.attachEvent) {
	ele.attachEvent('onsubmit', callback) //Old IE
}

function getPlayerIdFromString(event) {
	// console.log(event.target.value)
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
			console.log('Hello', player.personaname)
			console.log('Your winrate for the last %i games is %f%.', options.limit, winrate.toFixed(3))
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
	console.log('-----')
	console.log(
		'Banning %s would improve your winrate by %f%, to %f%',
		hero.heroName,
		change.toFixed(3),
		(winrate + change).toFixed(3)
	)
	console.log('As:      %i/%i', hero.win, hero.games)
	console.log('with:    %i/%i', hero.with_win, hero.with_games)
	console.log('Against: %i/%i', hero.against_win, hero.against_games)
	let greatestImpact = Math.min(
		hero.impact.against,
		hero.impact.with,
		hero.impact.me
	)
	if (greatestImpact == hero.impact.against) {
		console.log('The primary reason is %s on the enemy team.', hero.heroName)
	} else if (greatestImpact == hero.impact.with) {
		console.log(
			'The primary reason is an ally on your team playing %s.',
			hero.heroName
		)
	} else if (greatestImpact == hero.impact.me) {
		console.log('The primary reason is your own play with %s.', hero.heroName)
	}
}