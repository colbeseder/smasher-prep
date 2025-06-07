const GPTClue = require('./chatInterface')

function prepareEntry(title, resolve){
	let clueType = GPTClue.chooseClueType();
	GPTClue.getQuestion(title, clueType).then(x => {
		let content = x.data.choices[0].message.content;
		try {
			let obj = JSON.parse(content);
			let rawPattern = obj["ipa"].split("");
			let pattern = rawPattern.filter(x => [String.fromCodePoint(712), , "'", '', '.'].indexOf(x) == -1)
			if (pattern.length < 4){
				return
			}
			let result = {
				start: pattern.slice(0,3).join(''),
				end: pattern.slice(pattern.length -3).join(''),
				pattern: pattern
			}
			result["title"] = title
			result["clue"] = obj.clue;
			result["clueType"] = clueType;
			result["version"] = 10;
			resolve(result);

		}
		catch(er){
			console.log(title)
			console.log(x.data.choices[0]);
		}
	})
}

// Kept for reference
function extractIPAc(content){
	var match = /IPA(?:\([^\)]+\)?:\s*\/([^\/]+)\/)/.exec(content);
	if (match) {
		var rawPattern = match[1].split("");
		var pattern = rawPattern.filter(x => [String.fromCodePoint(712), , "'", '', '.'].indexOf(x) == -1)
		if (pattern.length < 4){
			return {};
		}
		return {start: pattern.slice(0,3).join(''), end: pattern.slice(pattern.length -3).join(''), pattern: pattern}
	}
	else {
		return {};
	}
}

module.exports = prepareEntry