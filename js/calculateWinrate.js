// given a ____, return a percentage chance of winning

module.exports = function calculateWinrateImprovement(winsEnemyHero, gamesEnemyHero, winsAll, gamesAll) {
	let winrate = (winsAll / gamesAll) || 0.5
	let newWins = winsAll - winsEnemyHero
	let newGames = (gamesAll - gamesEnemyHero)
	let newWinrate = (newWins / newGames) || 0.5
	return newWinrate - winrate
}
