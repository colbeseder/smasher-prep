source constants.sh
# Load the raw words into the database for prepare the entries
node ./removePlurals.js "resources/common-words.txt" | shuf > resources/titles

node app.js $API_Gateway
