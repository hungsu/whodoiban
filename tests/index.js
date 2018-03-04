let calculateWinrateImprovement = require('../js/calculateWinrate.js')
const getHeroName = require('../js/getHeroName')

// tests
console.assert(
	calculateWinrateImprovement(0,10,5,20) == 0.25,
	'Playing 50% of games against sniper, where I always lose against sniper, then banning sniper, should reset improve winrate'
)
console.assert(
	calculateWinrateImprovement(10, 10, 15, 20) == -0.25,
	'Playing 50% of games against sniper, where I always win against sniper, then banning sniper, should worsen winrate'
)
console.log('All calculateWinrate.js tests passed')

console.assert(getHeroName(1) == 'Anti-Mage', 'Hero ID 1 should be "Anti-Mage"')
console.assert(getHeroName("1") == '', 'Hero ID 1 should be ""')
console.assert(getHeroName(24) == '', 'Hero ID 24 should be ""')
console.assert(getHeroName(31) == 'Lich', 'Hero ID 1 should be "Anti-Mage"')
console.assert(getHeroName(120) == 'Pangolier', 'Hero ID 120 should be "Pangolier"')
console.log('All getHeroName.js tests passed')

console.log('All tests passed')