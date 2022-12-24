<template>
  <v-row justify="center" align="center">
    <v-col cols="12">
      <v-btn x-large @click="$refs.input.click()" class="mt-1 mx-10">
        <v-list-item-content>
          <input
            style="display: none"
            ref="input"
            type="file"
            accept=".txt"
            @change="onFileChange"
          />
          <v-list-item-title>
            テキストファイルから読込
          </v-list-item-title>
        </v-list-item-content>
      </v-btn>
      <v-btn x-large @click="textDialog=true" class="mt-1 mx-10">
        ノーマルテキストから解析
      </v-btn>
      <v-dialog
        transition="dialog-bottom-transition"
        max-width="600"
        v-model="textDialog"
      >
        <v-card elevation="4">
            <v-card-title class="justify-center">テキストを入力してください</v-card-title>
            <v-textarea
              v-model="text"
              outlined
              name="input-7-4"
              :height="Dheight"
            ></v-textarea>
          <v-btn block @click="analysis(text)">解析</v-btn>
        </v-card>
      </v-dialog>
    </v-col>
    <v-col cols="12">
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                行
              </th>
              <th class="text-left">
                文章
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in sentences"
              :key="item.id"
            >
              <td>{{ item.id }}</td>
              <td>{{ item.sentence }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>
  </v-row>
</template>

<script>
import Encoding from 'encoding-japanese'
import kuromoji from 'kuromoji'
// import * as func from '~/plugins/myPlugins'

export default {
  name: 'IndexPage',
  data () {
    return {
      file: null,
      encoding: '',
      text: '',
      textArray: [],
      sentences: [],
      textDialog: false
    }
  },
  mounted () {
    console.log('mounted')
  },
  computed: {
    Dheight () {
      return this.$vuetify.breakpoint.height / 3 * 2
    }
  },
  methods: {
    onFileChange (event) {
      this.file = event.target.files ? event.target.files[0] : null
      if (this.file) {
        this.get_text(this.file)
          .then(text => this.analysis(text))
      }
    },
    get_text (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          // uint8arrayにより数値配列に変換できる．=> detect()で扱えるかたちになる．
          const codes = new Uint8Array(e.target.result)
          const encoding = Encoding.detect(codes)
          const unicodeString = Encoding.convert(codes, {
            to: 'unicode',
            from: encoding,
            type: 'string'
          })
          this.encoding = encoding
          resolve(unicodeString)
        }
        reader.onerror = error => reject(error)
        reader.readAsArrayBuffer(file)
      })
    },
    // 文章をsplitIntoSentenceで分解して，perseSentenceで解析したものをテーブルに収める
    analysis (text) {
      console.log('analysis text')
      this.textArray = []
      this.sentences = []
      this.splitIntoSentence(text)
        .then(textArray => this.perseSentence(textArray))
    },
    // 文章を文末区切りで一文ごとに分解する．それを配列に格納する
    splitIntoSentence (text) {
      return new Promise((resolve) => {
        console.log('splitIntoSentence')
        text = text.replace(/[．。]/g, function (match) {
          if (match.length === 1) { return '.' }
          return match
        })
        text = text.replace(/\r?\n/g, '')
        this.text = text
        const textArray = text.split('.')
        this.textArray = textArray
        resolve(textArray)
      })
    },
    perseSentence (textArray) {
      console.log('perseSentence')
      for (let i = 0; i < textArray.length; i++) {
        const data = {}
        data.id = i
        data.sentence = textArray[i]
        this.sentences.push(data)
        this.perseByKuromoji(textArray[i])
      }
    },
    perseByKuromoji (text) {
      return new Promise((resolve) => {
        console.log('Kuromoji')
        setTimeout(
          kuromoji.builder({ dicPath: '/dict' }).build((err, tokenizer) => {
            if (err) {
              console.log(err)
            } else {
              console.log(text)
              const tokens = tokenizer.tokenize(text)
              console.log(tokens)
            }
          }), 3000)
      })
    }
  }
}
</script>
<style scoped>

</style>
