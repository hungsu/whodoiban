let calculateWinrateImprovement = require('../js/calculateWinrate.js')

// tests
console.assert(
	calculateWinrateImprovement(0,10,5,20) == 0.25,
	'Playing 50% of games against sniper, where I always lose against sniper, then banning sniper, should reset improve winrate'
)
console.assert(
	calculateWinrateImprovement(10, 10, 15, 20) == -0.25,
	'Playing 50% of games against sniper, where I always win against sniper, then banning sniper, should worsen winrate'
)
