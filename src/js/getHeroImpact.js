/**
 * @param  {} player
 * @param  {} playerHeroStats
 * @returns change
 */
export default function getHeroImpact(player, playerHeroStats) {
	// Calculate change in winrate if player never plays as hero
	// Calculate change in winrate if player never plays with hero
	// Calculate change in winrate if player never plays against hero

	let winrate = (player.wins / player.games) || 0.5
	let against = winrate - ((player.wins - playerHeroStats.against_win) / (player.games - playerHeroStats.against_games))
	let withHero = winrate - (player.wins - playerHeroStats.with_win) / (player.games - playerHeroStats.with_games)
	let asHero = winrate - (player.wins - playerHeroStats.win) / (player.games - playerHeroStats.games)

	let newWins = player.wins - playerHeroStats.win - playerHeroStats.with_win - playerHeroStats.against_win
	let newGames = player.games - playerHeroStats.games - playerHeroStats.with_games - playerHeroStats.against_games
	let newWinrate = (newWins / newGames) || 0.5
	let heroImpact = {
		against: against,
		with: withHero,
		me: asHero,
		all: newWinrate - winrate
	}
	return heroImpact
}
