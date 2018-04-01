import './js/form'
import './js/heroCards'

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
