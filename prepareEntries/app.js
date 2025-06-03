const axios = require('axios');
const { clear } = require('console');
const prepareEntry = require('./lookup');

const api_key = process.env.ENTRY_API_KEY ;

var apiURI = process.argv[2]

var dry_run = process.env.DRY; // Run with --env DRY=1
let totalInserts = 0;

const OVERWRITE_EXISTING = false;

function insertEntry(entry){
    if (!entry.title.trim()){
        return
    }
    if (entry.start && entry.end && entry.clue){
        totalInserts++ ;
        if(dry_run){
            console.log(`Writing: ${entry.title} : ${entry.clue}`)
        }
        else {
            var title = entry.title;
            axios.post(
                apiURI + "/api/entry/" + encodeURIComponent(entry.title),
                entry,
                { headers: {
                    'X-API-Key': process.env.SMASHER_API_KEY
                }
                }).catch(function(er){
                    console.log(`${er.response?.status} error on: "${title}"`);
                    console.log(er.response?.data);
                    requeue(entry);
                });
        }
    }
    else {
        console.log("Can't insert");
        console.log([entry.start, entry.end, entry.clue]);
    }
}

function prepareEntryIfNotAlreadyExists(entry, insertEntry){
    axios.get(apiURI + "/api/entry/" + encodeURIComponent(entry.title))
    .then(x => prepareEntry(item, insertEntry))
    .catch();
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
        axios.get(statusURL)
        .then(cb)
        .catch(function(){
            setTimeout(function(){onServerReady(statusURL, cb, interval*2)}, interval * 1000);
            console.log(`Retry ${statusURL} in ${interval} seconds`);
        });
}

var handle;
function dequeue(){
    if (queue.length === 0){
        setTimeout(finish, 1000);
        return;
    }
    var item = queue.pop();
    if (typeof item === "string"){
        try{
            if(OVERWRITE_EXISTING){
                prepareEntry(item, insertEntry);
            }
            else {
                isEntryAlreadyExists(item, insertEntry)
            }
        }
        catch(er){}
    }
    else { // item is a prepared entry object
        insertEntry(item);
    }
}

function finish(){
        clearInterval(handle);
        handle = null;
        console.log(`Queue is empty. Total insert (Attempts) ${totalInserts}`)
}

function requeue(x){
    console.log(`Requeue ${x.title || x}`)
    queue.unshift(x);
    if (!handle){
        startSending();
    }
}

function startSending(){
    console.log("Starting send");
    handle = setInterval(dequeue, 250);
}

insertAllRaw()
onServerReady(apiURI + "/api/status", startSending);