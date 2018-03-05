// const calculateWinrateImprovement = require('./js/calculateWinrate.js')
const getWinrateIfBanned = require('./js/getWinrateIfBanned')
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
			let hero = {
				heroName: heroName,
				change: getWinrateIfBanned(player, element),
				win: element.win,
				games: element.games,
				against_win: element.against_win,
				against_games: element.against_games,
				with_win: element.with_win,
				with_games: element.with_games,
				reason: element.against_games > (element.with_games+element.games) ? 'against' : 'with'
			}
			return hero
		})
		heroesWithChanges.sort((a, b) => {
			return b.change - a.change
		})
		let winrate = player.wins / player.games * 100
		let change = heroesWithChanges[0].change * 100
		console.log('Hello', player.personaname)
		console.log(
			'Your current winrate for the last %i games is %f%.',
			options.limit,
			winrate.toFixed(3)
		)
		printHero(heroesWithChanges[0], winrate)
		printHero(heroesWithChanges[1], winrate)
		printHero(heroesWithChanges[2], winrate)
		printHero(heroesWithChanges[3], winrate)
		printHero(heroesWithChanges[4], winrate)
	})
}

let options = {
	limit: 150
}
// getPlayerHeroes(33839830, options) // Hung-Su
// getPlayerHeroes(57484346, options) // Jason
getPlayerHeroes(74196344, options) // Ben
// getPlayerHeroes(85123839) // Mitch

function printHero(hero, winrate) {
	change = hero.change * 100
	console.log(
		'Banning %s would improve your winrate by %f%, to %f%',
		hero.heroName,
		change.toFixed(3),
		(winrate + change).toFixed(3)
	)
	console.log('As:      %f/%f', hero.win, hero.games)
	console.log('with:    %f/%f', hero.with_win, hero.with_games)
	console.log('Against: %f/%f', hero.against_win, hero.against_games)
	if (hero.reason == 'with') {
		console.log(
			'The reason is mainly %s on your own team.',
			hero.heroName
		)
	} else {
		console.log(
			'The reason is mainly %s on the enemy team.',
			hero.heroName
		)
	}
}