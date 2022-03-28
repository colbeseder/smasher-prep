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
				var EnglishData = data.replace(/^[\s\S]==\s*English\s*==/im, '');
				EnglishData = EnglishData.replace(/([^=])==[^=][\s\S]*/m, '$1')
				result["clue"] = chooseBestClue(EnglishData, title)
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

function getClues(content){
	var REs = [
		/=+ (?:Adjective) =+\n.*?(?:\n\n)([^=]+)/,
		/=+ (?:Noun) =+\n.*?(?:\n\n)([^=]+)/,
		/=+ (?:Verb) =+\n.*?(?:\n\n)([^=]+)/,
		/=+ (?:Adverb) =+\n.*?(?:\n\n)([^=]+)/
	];
	var re, match;
	var clues = [];
	var splitter = /\n{2,}/g ;
	if (!splitter.test(content)){
		splitter = /\n/g ;
	}
	for (var i = 0; i < REs.length ; i++){
		re = REs[i];
		match = re.exec(content);
		if (match){
			var clueBlock = match[1].trim();

			var moreClues = clueBlock.split(splitter).map(x=>cleanUpLinks(x.replace(/[.;\n][\s\S]*/m, '')).trim());
			moreClues[0] = "*" + moreClues[0]; // Star indicates first clue of type
			clues = clues.concat(moreClues);
		}
	}
	return clues;
}

function removeBrackets(s){
    return s.replace(/\([^)]*\)?\s*/g, '');
}

function rateClue(clue, title){
	var score = 50;
	if (/^\*/.test(clue)){
		// First definition (for word type)
		score += 21;
		clue = clue.replace(/^\*/, "");
	}
	if (/\(|\)/.test(clue)){ // Contains brackets
		score -= 10;
	}
	if (/\[|\]|\{|\}/.test(clue)){ // Contains brackets
		score -= 30;
	}
	if (/historical|rare|archaic|obsolete|slur|ethnic|dated/i.test(clue)){
		score -= 40;
	}
	if (/participle|tense|thesaurus/i.test(clue)){
		score -= 25;
	}
	clue = removeBrackets(clue);
	if (clue.length < 3 || clue.length > 150){
		score = 0;
	}

	if (/^\(? *\d/.test(clue)){ // Starts with a number
		score = 0;
	}
	if (clue.length > 100){
		score -= 7
	}
	if (/Synonym/i.test(clue)){
		score += 10;
	}
	else if(/:/.test(clue)){
		score -= 10;
	}
	if (
		title.length >= 4 && 
		(clue.indexOf(title.slice(0, 4)) > -1) ){ // Clue contains start of word
			score -= 20;
		}
	else if (
		title.length >= 3 && 
		(clue.indexOf(title.slice(0, 3)) > -1) ){ // Clue contains start of word
			score -= 15;
		}
	return score;
}

function chooseBestClue(content, title){
	var clues = getClues(content);
	if (clues.length === 0){
		return '';
	}

	var ratedClues = clues.map(clue => ({clue:clue.replace(/^\*/, ""), score: rateClue(clue, title)}) )
	var sortedCluesObj = ratedClues.sort((a, b) => {return b.score - a.score});
	/*
	if (false){
		console.log(`__${title}__`);
		for (var i = 0 ; i < ratedClues.length; i++){
			console.log(`${ratedClues[i].score} : ${ratedClues[i].clue}`);
		}
		console.log("----------");
	}
	*/
	var bestClueObj = sortedCluesObj[0];
	if (bestClueObj.score < 1){
		return '';
	}
	//console.log(sortedCluesObj);
	//console.log(`${title}: ${bestClueObj.clue}`);
	return bestClueObj.clue ;
}

module.exports = prepareEntry