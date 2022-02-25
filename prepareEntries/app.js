const axios = require('axios');
const { clear } = require('console');
const prepareEntry = require('./prep');

var apiURI = process.argv[2]

function insertEntry(entry){
    if (entry.start && entry.end && entry.clue){
        //console.log(`Writing: ${entry.title}`)
        axios.post(apiURI + "/api/entry/" + encodeURIComponent(entry.title), entry).catch();
    }
}

var queue = [];

function insertAllRaw(){
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream('resources/titles')
    });
    
    lineReader.on('line', function (line) {
        var word = line.trim().toLocaleLowerCase();
        if (/^[a-z'\-]+$/i.test(word)){
            queue.push(word);
         }
     });
}

var handle;
function dequeue(){
    if (queue.length === 0){
        clearInterval(handle);
        return;
    }
    prepareEntry(queue.pop(), insertEntry);
}

insertAllRaw();
console.log(queue.slice(0,5).join());
handle = setInterval(dequeue, 20);