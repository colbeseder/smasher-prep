const axios = require('axios');
const { clear } = require('console');
const prepareEntry = require('./prep');

const api_key = process.env.ENTRY_API_KEY ;

var apiURI = process.argv[2]

var dry_run = process.env.DRY; // Run with --env DRY=1

function insertEntry(entry){
    if (entry.start && entry.end && entry.clue){
        if(dry_run){
            console.log(`Writing: ${entry.title} : ${entry.clue}`)
        }
        else {
            axios.post(
                apiURI + "/api/entry/" + encodeURIComponent(entry.title),
                entry,
                { headers: {
                    'X-API-Key': api_key
                }
                }).catch();
        }
    }
}

var queue = [];

function insertAllRaw(){
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream('resources/titles')
    });
    
    lineReader.on('line', function (line) {
        var word = line.trim();
        queue.push(word);
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
handle = setInterval(dequeue, 25);