const kuromoji = require('kuromoji')

const DICT_PATH = '/dict'
// Tokenizerの作成
function getTokenizer () {
  return new Promise((resolve) => {
    kuromoji.builder({ dicPath: DICT_PATH }).build((tokenizer) => {
      resolve(tokenizer)
    })
  })
}

export const perseByKuromoji = async (text) => {
  const tokens = await getTokenizer()
    .then((tokenizer) => {
      console.log(text)
      const tokens = tokenizer.tokenize(text)
      for (let i = 0; i < tokens.length; i++) {
        console.log(tokens[i])
      }
      return tokens
    })
  return tokens
}
