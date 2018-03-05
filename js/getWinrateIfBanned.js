// given a hero and a player, return a percentage chance of winning
module.exports = function getWinrateIfBanned(player, playerHeroStats) {

	let winrate = (player.wins / player.games) || 0.5
	// let winrate = (winsAll / gamesAll) || 0.5
	let newWins = player.wins - playerHeroStats.win - playerHeroStats.with_win - playerHeroStats.against_win
	let newGames = player.games - playerHeroStats.games - playerHeroStats.with_games - playerHeroStats.against_games
	let newWinrate = (newWins / newGames) || 0.5
	return newWinrate - winrate
}
