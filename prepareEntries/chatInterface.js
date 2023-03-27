const OPENAI_KEY = process.env.OPENAI_KEY;

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: OPENAI_KEY
  });
const openai = new OpenAIApi(configuration);

function getQuestion(entry) {
    const message = [
        { role: "system", content: `Respond in JSON, with no other text. Like this {"ipa":"","clue":""}
        "clue" is a very short, snappy clue, where the answer is "${entry}". The clue should not include any form of the word "${entry}". "ipa" is the IPA pronunciation for "${entry}".` }
      ];
    return openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        max_tokens: 50,
        messages: message,
    })
}

module.exports = { getQuestion }