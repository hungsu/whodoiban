const calculateWinrateImprovement = require('./js/calculateWinrate.js')
const axios = require('axios')
const getHeroName = require('./js/getHeroName')

// Given a steam ID, get list of player's winrate against all DotA heroes
function getPlayerHeroes(steamID) {
	console.log('Starting promises')
	let b1 = axios
		.get('https://api.opendota.com/api/players/' + steamID + '/heroes')
		.catch(function(error) {
			console.log(error)
		})
	let b2 = axios.get('https://api.opendota.com/api/players/' + steamID + '/wl')

	Promise.all([b1, b2]).then(function(values) {
		let player = { wins: values[1].data.win, losses: values[1].data.lose, games: values[1].data.win + values[1].data.lose }
		values[0].data.forEach((element) => {
			let heroName = getHeroName(parseInt(element.hero_id, 10))
			getWinrateChange(heroName, element.against_win, element.against_games, player)
		})
	})
}

// getPlayerHeroes(33839830)
getPlayerHeroes(57484346)
// getPlayerHeroes(74196344)

function getWinrateChange(heroName, heroWins, heroGames, player) {
	let winrateChange = calculateWinrateImprovement(
		heroWins,
		heroGames,
		player.wins,
		player.games
	)
	// let winrateChange = calculateWinrateImprovement(heroWins, heroGames, 679, 1382)
	let adjective = winrateChange > 0 ? 'improves' : 'decreases'
	console.log(
		'Banning ' + heroName.padEnd(19) + ': %s winrate by %s',
		adjective,
		Number.parseFloat(winrateChange * 100).toFixed(4) + '%'
	)
}
