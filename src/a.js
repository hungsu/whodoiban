import getPlayerHeroData from './js/getPlayerHeroData'
import getHeroImpact from './js/getHeroImpact'
import {getHeroName,getImageUrl} from './js/getHeroName'
import debounce from 'debounce'
import buildTemplate from './js/buildTemplate'

var ele = document.getElementById('player')

if (ele.addEventListener) {
	ele.addEventListener('submit', getPlayerSuggestions, false) //Modern browsers
	ele.addEventListener('keyup', debounce(getPlayerSuggestions, 500), false) //Modern browsers

	document.getElementById('ranked').addEventListener('change', function(event) {
		console.log(this.checked)
	})

	document.getElementById('players').addEventListener('click', function(event) {
		let buttonEl = event.path.reduce(function(accumulator, current) {
			if (current.tagName && current.tagName.toLowerCase() == 'button') {
				return current
			} else {
				return accumulator
			}
		})
		if (buttonEl != undefined) {
			let account_id = buttonEl.getAttribute('data-account-id')
			if (account_id.length > 0) {
				document.getElementById('players').innerHTML = ''
				getAndPrint(account_id)
			}
		}
	})
} else if (ele.attachEvent) {
	ele.attachEvent('onsubmit', callback) //Old IE
}

function useSuggestion(event) {
	event.preventDefault()
	let account_id = event.currentTarget.getAttribute('data-account-id')
	if (account_id.length > 0) {
		document.getElementById('players').innerHTML = ''
		getAndPrint(account_id)
	}
}

function getPlayerSuggestions(event) {
	event.preventDefault() // Prevent page reload on submitting form
	let inputEl = event.target
	let userInput = inputEl.value
	let valid = userInput.length > 2 && parseInt(userInput) !== NaN
	if (valid) {
		document.getElementById('players').innerHTML = 'Loading'
		axios
			.get('https://api.opendota.com/api/search?q=' + userInput)
			.then(function(response) {
				let playersEl = document.getElementById('players')
				playersEl.innerHTML = ''
				let topResults = response.data.slice(0, 9)
				topResults.forEach(element => {
					let buildPlayerHTML = buildTemplate('t-player')
					let playerHTML = buildPlayerHTML({
						img: '<img src="' + element.avatarfull + '">',
						account_id: element.account_id,
						personaname: element.personaname
					})
					let template = document.getElementById('t-player').innerHTML
					let playerEl = document.createElement('div')
					playerEl.innerHTML = playerHTML
					playersEl.appendChild(playerEl)
				})
			})
	}
}

/**
 * Take an integer rank and returns an image filename string
 * Sample:
 * null => SeasonalRank0-0.png
 * 40 => SeasonalRank4-0.png
 * @param {Integer} rank_tier
 * @returns {String}
 */
function imageForRank(rank_tier) {
	let base =
		'https://d1u5p3l4wpay3k.cloudfront.net/dota2_gamepedia/c/c1/SeasonalRank'
	let rankFilename = 0 - 0
	if (rank_tier != null) {
		let rankString = rank_tier + ''
		rankFilename = rankString.charAt(0) + '-' + rankString.charAt(1)
	}
	return base + rankFilename + '.png'
}

function getAndPrint(account_id) {
	let playerId = parseInt(account_id, 10)
	if (playerId > 0) {
		let options = { limit: 100 }
		if (document.getElementById('ranked').checked) {
			options['lobby_type'] = 7
		} else {
			options['lobby_type'] = 0
		}
		document.getElementById('summary').innerHTML = 'Loading'
		document.getElementById('suggestions').innerHTML = ''

		getPlayerHeroData(playerId, options).then(function(values) {
			let player = values[2].data.profile
			let rank_tier = values[2].data.rank_tier
			if (rank_tier != '') {
				let image = imageForRank(rank_tier)
				console.log(image)
			}
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
