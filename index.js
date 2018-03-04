const calculateWinrateImprovement = require('./js/calculateWinrate.js')
const axios = require('axios')
const getHeroName = require('./js/getHeroName')

// Given a steam ID, get list of player's winrate against all DotA heroes
function getPlayerHeroes(steamID) {
	let b1 = axios
		.get('https://api.opendota.com/api/players/' + steamID + '/heroes')
		.catch(function(error) {
			console.log(error)
		})
	let b2 = axios.get('https://api.opendota.com/api/players/' + steamID + '/wl')

	Promise.all([b1, b2]).then(function(values) {
		let player = {
			wins: values[1].data.win,
			losses: values[1].data.lose,
			games: values[1].data.win + values[1].data.lose
		}
		let heroesWithChanges = values[0].data.map(element => {
			let heroName = getHeroName(parseInt(element.hero_id, 10))
			let hero = {
				heroName: heroName,
				change: calculateWinrateImprovement(
					element.against_win,
					element.against_games,
					player.wins,
					player.games
				)
			}
			return hero
		})
		heroesWithChanges.sort((a, b) => {
			return b.change - a.change
		})
		let winrate = player.wins / player.games * 100
		let change = heroesWithChanges[0].change * 100
		console.log('Your current winrate is %f%.', winrate.toFixed(3))
		console.log(
			'Banning %s would improve your winrate by %f%, to %f%',
			heroesWithChanges[0].heroName,
			change.toFixed(3),
			(winrate + change).toFixed(3)
		)
	})
}

getPlayerHeroes(33839830) // Hung-Su
// getPlayerHeroes(57484346) // Jason
// getPlayerHeroes(74196344) // Ben
// getPlayerHeroes(85123839) // Mitch
