import getPlayerHeroData from './getPlayerHeroData'
import { getHeroName, getImageUrl } from './getHeroName'
import getHeroImpact from './getHeroImpact'
import buildTemplate from './buildTemplate'
import store from './store'

window.getAndPrint = function(playerId) {
	if (playerId > 0) {
		let options = { limit: document.getElementById('gamelimit').value }
		options['lobby_type'] = document.getElementById('ranked').value
		document.getElementById('summary').className = 'loading'
		document.getElementById('summary').innerHTML = ''
		document.getElementById('suggestions').innerHTML = ''

		getPlayerHeroData(playerId, options).then(function(values) {
			let player = values[2].data.profile
			// let rank_tier = values[2].data.rank_tier
			// console.log('rank_tier:', rank_tier)
			// if (rank_tier != '') {
			// 	let image = imageForRank(rank_tier)
			// 	console.log(image)
			// }
			player.wins = values[1].data.win
			;(player.losses = values[1].data.lose),
				(player.games = values[1].data.win + values[1].data.lose)

			let heroesWithChanges = values[0].data.map(element => {
				let heroName = getHeroName(parseInt(element.hero_id, 10))
				let hero = Object.assign(
					{
						heroFileName: getImageUrl(parseInt(element.hero_id, 10)),
						heroName: heroName,
						impact: getHeroImpact(player, element)
					},
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
				account_id: playerId,
				img: '<img src="' + player.avatarfull + '">',
				name: player.personaname,
				games: options.limit,
				winrate: winrate
			})

			document.getElementById('summary').className = ''
			document.getElementById('summary').innerHTML = outputHtml
			let suggestions = [
				printHero(heroesWithChanges[0], player),
				printHero(heroesWithChanges[1], player),
				printHero(heroesWithChanges[2], player),
				printHero(heroesWithChanges[3], player),
				printHero(heroesWithChanges[4], player),
				printHero(heroesWithChanges[5], player),
				printHero(heroesWithChanges[6], player),
				printHero(heroesWithChanges[7], player),
				printHero(heroesWithChanges[8], player),
				printHero(heroesWithChanges[9], player),
				printHero(heroesWithChanges[10], player),
				printHero(heroesWithChanges[11], player)
			].join('')
			document.getElementById('suggestions').innerHTML = suggestions
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
	if (
		greatestImpact == hero.impact.against &&
		greatestImpact == hero.impact.with
	) {
		reason = 'equally the enemy team and your own team playing ' + hero.heroName
	} else if (greatestImpact == hero.impact.against) {
		reason = hero.heroName + ' on the enemy team.'
	} else if (greatestImpact == hero.impact.with) {
		reason = 'an ally on your team playing ' + hero.heroName
	} else if (greatestImpact == hero.impact.me) {
		reason = 'your own play with ' + hero.heroName
	}

	let suggestionTemplate = buildTemplate('t-suggestion')
	let outputHtml = suggestionTemplate({
		heroFileName: hero.heroFileName,
		heroName: hero.heroName,
		change: change.toFixed(3),
		newWinrate: (winrate + change).toFixed(3),
		as: hero.win + '/' + hero.games,
		with: hero.with_win + '/' + hero.with_games,
		against: hero.against_win + '/' + hero.against_games,
		reason: reason
	})
	return outputHtml
}
