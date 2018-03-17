// Given a steam ID, get list of player's winrate against all DotA heroes
export default function getPlayerHeroData(steamID, options) {
	let promises = [axios.get(
			'https://api.opendota.com/api/players/' + steamID + '/heroes',
			{
				params: options
			}
		), axios.get('https://api.opendota.com/api/players/' + steamID + '/wl', {
			params: options
		}), axios.get('https://api.opendota.com/api/players/' + steamID)]

	return Promise.all(promises)
}
