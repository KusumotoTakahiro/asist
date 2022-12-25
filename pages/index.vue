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
            テキストファイルから解析
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
            class="my-0"
            name="input-7-4"
            :height="Dheight"
          ></v-textarea>
          <v-row>
            <v-col>
              <v-btn class="mx-0" block @click="analysis(text)">解析</v-btn>
            </v-col>
            <v-col>
              <v-btn class="mx-0" block @click="text=''">全文削除</v-btn>
            </v-col>
          </v-row>
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
              <th class="text-left">
                主語
              </th>
              <th class="text-left">
                述語
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
              <td>
                <template v-for="syugo in item.syugo">
                  <div :key="syugo">{{ syugo }},</div>
                </template>
              </td>
              <td>
                <template v-for="zyutugo in item.zyutugo">
                  <div :key="zyutugo">{{ zyutugo }},</div>
                </template>
              </td>
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
import * as func from '~/plugins/myPlugins'

export default {
  name: 'IndexPage',
  data () {
    return {
      file: null,
      fileTitle: '',
      encoding: '',
      text: '',
      sentences: [],
      textDialog: false
    }
  },
  mounted () {
    console.log('mounted')
    if (!this.$store.state.isLogin) {
      this.$store.commit('login')
    } else {
      this.sentences = this.$store.state.nowData.nowData
    }
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
        this.fileTitle = this.file.name
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
      this.sentences = []
      this.splitIntoSentence(text)
        .then(text => this.perseSentence(text))
    },
    // 文章を文末区切りで一文ごとに分解する．それを配列に格納する
    splitIntoSentence (text) {
      return new Promise((resolve) => {
        console.log('splitIntoSentence')
        text = text.replace(/[．。]/g, function (match) {
          if (match.length === 1) { return '*' }
          return match
        })
        text = text.replace(/\r?\n/g, '')
        this.text = text
        resolve(text)
      })
    },
    async perseSentence (text) {
      console.log('perseSentence')
      // 形態素解析を行った文章を*区切りで分割しておく
      const tokens = await this.perseByKuromoji(text)
      let data = {}
      let id = 0
      let sentence = ''
      let syugo = [] // 主語の集合
      let zyutugo = [] // 述語の集合
      let word = '' // 主語
      let word2 = '' // 述語
      let sf = ''
      let pos = ''
      let verb = false // 直前が動詞か否かのフラグ
      for (let i = 0; i < tokens.length; i++) {
        console.log(tokens[i])
        sf = tokens[i].surface_form
        pos = tokens[i].pos
        sentence += sf
        word += sf
        /* 主語を判定しつつ抽出する処理
          (は，が以外の助詞) + (は，が以外の文字) + (は，が)
          を述語判定の形として，（は，が以外の助詞）を無視して
          （は，が）が来たタイミングで主語として抽出していく
        */
        if (sf === ('が')) {
          syugo.push(word)
          word = ''
        } else if (sf === ('は')) {
          syugo.push(word)
          word = ''
        } else if (func.isZyoshi(sf)) {
          word = ''
        }
        /* 述語を判定しつつ抽出する処理
          （は，が以外の文字）＋（動詞）＋（動詞以外）
          を述語判定の形として，動詞ー＞動詞以外がきたタイミングで
          述語として抽出していく
        */
        if (pos === '動詞') {
          word2 += sf
          verb = true
        } else if (verb && (pos !== '動詞')) {
          zyutugo.push(word2)
          word2 = ''
          verb = false
        } else if (sf === ('が')) {
          word2 = ''
          verb = false
        } else if (sf === ('は')) {
          word2 = ''
          verb = false
        } else {
          word2 += sf
        }
        if (tokens[i].surface_form.match(/\*/)) {
          console.log(sf)
          data.id = id
          data.sentence = sentence.slice(0, sentence.length - 1)
          data.syugo = syugo
          data.zyutugo = zyutugo
          this.sentences.push(data)
          data = {}
          id += 1
          sentence = ''
          syugo = []
          zyutugo = []
          word = ''
          word2 = ''
          verb = false
        }
      }
      const now = new Date()
      const nowTime = now.getMonth() + '/' + now.getDate() + ' ' + now.getHours() + ' : ' + now.getMinutes()
      this.$store.commit('addSaveData', {
        text: this.sentences,
        title: this.fileTitle !== '' ? this.fileTitle : 'ノーマルテキストより',
        time: nowTime
      })
      this.$store.commit('addNowData', {
        nowData: this.sentences
      })
      this.fileTitle = ''
    },
    perseByKuromoji (text) {
      return new Promise((resolve) => {
        console.log('Kuromoji')
        setTimeout(
          kuromoji.builder({ dicPath: '/dict' }).build((err, tokenizer) => {
            if (err) {
              console.log(err)
            } else {
              const tokens = tokenizer.tokenize(text)
              resolve(tokens)
            }
          }), 3000)
      })
    }
  }
}
</script>
<style scoped>

</style>
