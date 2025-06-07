const OPENAI_KEY = process.env.OPENAI_KEY;

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: OPENAI_KEY
  });
const openai = new OpenAIApi(configuration);

const clueTypes = {
  "a very short, snappy clue": 30,
  "a short, snappy, funny clue": 15,
  "a very easy, short clue": 25,
  "a clue suitable for children": 10,
  "a very easy, short, off-the-wall clue": 10,
  "a short, pithy clue": 5,
  "a very short, and slightly cryptic clue": 5
};

function chooseClueType(){
  let values = Object.values(clueTypes);
  let max = values.reduce((a, b) => a + b, 0);
  let pick = Math.floor(Math.random() * max);

  let keys = Object.keys(clueTypes);

  let total = 0;
  for (let i = 0; i < keys.length; i++){
    let k = keys[i];
    total += clueTypes[k];
    if (total > pick){
      return k;
    }
  }
  return keys[0];
}


function getQuestion(entry, clueType) {
    clueType = clueType || chooseClueType();
    const message = [
        { role: "system", content: `Respond in JSON, with no other text. Like this {"ipa":"","clue":""}
        "clue" is a ${clueType}, where the answer is "${entry}". The clue should not include any form of the word "${entry}". "ipa" is the IPA pronunciation for "${entry}".` }
      ];

    return openai.createChatCompletion({
        model: "gpt-4.1-nano",
        max_tokens: 50,
        messages: message,
    })
}

module.exports = { getQuestion, clueTypes, chooseClueType}