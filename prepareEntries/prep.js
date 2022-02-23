const axios = require('axios')


//var contentQuery = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&utf8=1&rvprop=content&rvslots=main&rvsection=0&explaintext&exintro&titles=";
const contentQuery = "https://en.wiktionary.org/w/api.php?action=query&format=json&prop=extracts&explaintext&utf8=1&titles="

function prepareEntry(title, cb){
	axios.get(contentQuery + encodeURIComponent(title))
		.then(function(res){
			try {
				var pages = res.data.query.pages;
				var id = Object.keys(pages)[0]
				var data = pages[id].extract
				result = extractIPAc(data);
				result["clue"] = chooseClue(data)
				result["success"] = true;
				result["title"] = title;

				cb(result)
		}
		catch(err){
			cb({title: title, success: false})
		}
	});
}

const stressChar = String.fromCodePoint(712);

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

function cleanUpLinks(clue){
	return clue.replace(/\[\[(.*?)(\|(.*?))?\]\]/g, function(a, b, c, d){
		if (d) {
			return d
		}
		return b;
	})
}

function chooseClue(content){
	var match = /=+ (?:Noun|Adjective) =+\n.*?(?:\n\n)(.+?)[.;]/.exec(content);
	if (match) {
		return cleanUpLinks(match[1]);
	}
	else {
		return '';
	}
}

module.exports = prepareEntry