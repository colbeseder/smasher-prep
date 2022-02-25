source constants.sh
# Load the raw words into the database for prepare the entries
grep "^[a-z]\{3,\}" "resources/common-words.txt" > resources/ordered_titles
cat resources/ordered_titles | shuf > resources/titles

node app.js $API_Gateway
