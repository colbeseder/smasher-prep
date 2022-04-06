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
            var title = entry.title;
            axios.post(
                apiURI + "/api/entry/" + encodeURIComponent(entry.title),
                entry,
                { headers: {
                    'X-API-Key': api_key
                }
                }).catch(function(er){
                    requeue(entry);
                    console.log(`Error on: ${title}`);
                });
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


function onServerReady(statusURL, cb, interval){
        interval = interval || 1 //second
        axios.get(apiURI + "/api/status")
        .then(cb)
        .catch(function(){
            setTimeout(function(){startSendingIfReady(statusURL, cb, interval*2)}, interval * 1000);
            console.log(`Retry ${statusURL} in ${startSendingInterval} seconds`)
        });
}

var handle;
function dequeue(){
    if (queue.length === 0){
        clearInterval(handle);
        handle = null;
        return;
    }
    var item = queue.pop();
    if (typeof item === "string"){
        prepareEntry(item, insertEntry);
    }
    else { // item is a prepared entry object
        insertEntry(item);
    }
}

function requeue(x){
    console.log(`Requeue ${x.title || x}`)
    queue.push(x);
    if (!handle){
        startSending();
    }
}

function startSending(){
    console.log("Starting send");
    handle = setInterval(dequeue, 250);
}

function combinerReady(){
    onServerReady(apiURI + "/api/status", startSending);
}

insertAllRaw()
onServerReady("http://127.0.0.1:5000/status", combinerReady);