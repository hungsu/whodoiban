export default function buildTemplate(templateId) {
    let templateString = document.getElementById(templateId).innerHTML
	return function(properties) {
		let outputHTML = templateString
		Object.keys(properties).forEach(function(key,index){
			let property = properties[key]
			outputHTML = outputHTML.split('${' + key + '}').join(property)
		})
		return outputHTML
	}
}
