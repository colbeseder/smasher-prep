const axios = require('axios')
const prepareEntry = require('./prep');

var apiURI = process.argv[2]

function prepareNextEntry(){
    axios.get(apiURI + "/api/q")
        .then(function(res){
            //console.log(res)
            prepareEntry(res.data._id, insertEntry)
        });
    
}

function insertEntry(entry){
    console.log(entry)
    if (entry.start && entry.end && entry.clue){
        axios.post(apiURI + "/api/entry/" + encodeURIComponent(entry.title), entry);
    }
}

setInterval(prepareNextEntry, 25);