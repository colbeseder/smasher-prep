var fileName = process.argv[2];

var fs = require('fs');
var existing = fs.readFileSync(fileName).toString().split("\n");

var newWords = [];

for (var i = 0 ; i < existing.length; i++){
    var word = existing[i];
    if (/s$/.test(word)){
        if (existing.indexOf(word.slice(0,word.length-1)) > -1){
            continue;
        }
    }
    if (/ies$/.test(word)){
        if (existing.indexOf(word.slice(0,word.replace(/ies$/, 'y'))) > -1){
            continue;
        }
    }
    if (/es$/.test(word)){
        if (existing.indexOf(word.slice(0,word.replace(/es$/, ''))) > -1){
            continue;
        }
    }
    console.log(word)
}

