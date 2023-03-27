source secrets.sh

# Load the raw words into the database for prepare the entries
node ./removePlurals.js $WORD_LIST  > resources/titles


node app.js $API_Gateway
