const getHeroName = require('../js/getHeroName')

// tests
console.assert(getHeroName(1) == 'Anti-Mage', 'Hero ID 1 should be "Anti-Mage"')
console.assert(getHeroName("1") == '', 'Hero ID "1" should be ""')
console.assert(getHeroName(24) == '', 'Hero ID 24 should be ""')
console.assert(getHeroName(31) == 'Lich', 'Hero ID 1 should be "Anti-Mage"')
console.assert(getHeroName(120) == 'Pangolier', 'Hero ID 120 should be "Pangolier"')
console.log('All getHeroName.js tests passed')

console.log('All tests passed')