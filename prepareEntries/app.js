const axios = require('axios')
const prepareEntry = require('./prep');

var apiURI = process.argv[2]
var interval = 20;

function prepareNextEntry(){
    axios.get(apiURI + "/api/q")
        .then(function(res){
            if (!/[a-z]/i.test(res?.data?._id)){
                // Queue is empty?
                interval *= 2;
                interval = Math.min(interval, 5*60*1000);
                return;
            }
            else {
                interval = 20;
            }
            //console.log(res)
            prepareEntry(res.data._id, insertEntry)
        })
        .catch(er => {
            interval *= 2;
        });
    setTimeout(prepareNextEntry, interval);
}

function insertEntry(entry){
    console.log(entry)
    if (entry.start && entry.end && entry.clue){
        axios.post(apiURI + "/api/entry/" + encodeURIComponent(entry.title), entry).catch();
    }
}

prepareNextEntry()