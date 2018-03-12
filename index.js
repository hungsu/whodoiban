const getHeroImpact = require('./js/getHeroImpact')
const axios = require('axios')
const getHeroName = require('./js/getHeroName')

// Given a steam ID, get list of player's winrate against all DotA heroes
function getPlayerHeroes(steamID, options) {
	let promises = [
		axios.get(
			'https://api.opendota.com/api/players/' +
				steamID +
				'/heroes?limit=' +
				options.limit
		),
		axios.get(
			'https://api.opendota.com/api/players/' +
				steamID +
				'/wl?limit=' +
				options.limit
		),
		axios.get('https://api.opendota.com/api/players/' + steamID)
	]

	Promise.all(promises).then(function(values) {
		let player = {
			personaname: values[2].data.profile.personaname,
			avatarfull: values[2].data.profile.avatarfull,
			wins: values[1].data.win,
			losses: values[1].data.lose,
			games: values[1].data.win + values[1].data.lose
		}
		let heroesWithChanges = values[0].data.map(element => {
			let heroName = getHeroName(parseInt(element.hero_id, 10))
			let hero = Object.assign({
				heroName: heroName,
				impact: getHeroImpact(player, element),
			}, element)
			return hero
		})
		heroesWithChanges.sort((a, b) => {
			return b.impact.all - a.impact.all
		})
		let winrate = player.wins / player.games * 100
		console.log('Hello', player.personaname)
		console.log(
			'Your winrate for the last %i games is %f%.',
			options.limit,
			winrate.toFixed(3)
		)
		printHero(heroesWithChanges[0], player)
		printHero(heroesWithChanges[1], player)
		printHero(heroesWithChanges[2], player)
		printHero(heroesWithChanges[3], player)
		printHero(heroesWithChanges[4], player)
	})
}

let options = {
	limit: 200
}
getPlayerHeroes(33839830, options) // Hung-Su

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
	console.log('As:      %f/%f', hero.win, hero.games)
	console.log('with:    %f/%f', hero.with_win, hero.with_games)
	console.log('Against: %f/%f', hero.against_win, hero.against_games)
	let greatestImpact = Math.min(hero.impact.against,hero.impact.with,hero.impact.me)
	if (greatestImpact == hero.impact.against) {
		console.log('The primary reason is %s on the enemy team.',hero.heroName)
	} else if (greatestImpact == hero.impact.with) {
		console.log('The primary reason is an ally on your team playing %s.', hero.heroName)
	} else if (greatestImpact == hero.impact.me) {
		console.log('The primary reason is your own play with %s.', hero.heroName)
	}
}
