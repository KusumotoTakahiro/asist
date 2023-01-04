<template>
  <v-row justify="center" align="center">
    <v-col cols="12">
      <v-row justify="space-around" class="mt-8 mb-5">
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
      </v-row>
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
                <v-checkbox disabled></v-checkbox>
              </th>
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
              :style="selectedDatas.includes(item.id) ? selectedRow : notSelectedRow"
            >
              <td><v-checkbox
                v-model="selectedDatas"
                :value="item.id"
                @click="saveSelectedDatas"
              ></v-checkbox></td>
              <td>{{ item.id }}</td>
              <td>{{ item.sentence }}</td>
              <td :width="syugoWidth">
                <template v-for="syugo in item.syugo">
                  <div :key="syugo.id">【{{ syugo.word }}】</div>
                </template>
              </td>
              <td>
                <template v-for="zyutugo in item.zyutugo">
                  <div :key="zyutugo.id">【{{ zyutugo.word }}】</div>
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
      textDialog: false,
      selectedDatas: [],
      selectedRow: { 'background-color': '' },
      notSelectedRow: { 'background-color': 'rgba(230,129,129,0.2)' },
      max_word: 10 // 最大文字数をカウントし，表の幅に使う．
    }
  },
  mounted () {
    console.log('mounted')
    if (!this.$store.state.isLogin) {
      this.$store.commit('login')
      console.log('login')
    } else {
      this.sentences = this.$store.state.nowData.nowData
      this.selectedDatas = this.$store.state.saveList[this.$store.state.nowID].selected
      console.log(this.$store.state.nowData.nowData)
      console.log(this.$store.state.nowID)
      console.log(this.$store.state.saveList[this.$store.state.nowID])
    }
  },
  beforeDestroy () {
    console.log('beforeDestroy')
    this.$store.commit('addSelectedDatas', this.selectedDatas)
  },
  computed: {
    Dheight () {
      return this.$vuetify.breakpoint.height / 3 * 2
    },
    syugoWidth () {
      return (this.max_word + 2) * 15
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
      this.selectedDatas = []
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
      // 文末コロンチェック
      if (!text[text.length - 1].match(/\*/)) {
        text += '*'
      }
      // 形態素解析を行った文章を*区切りで分割しておく
      const tokens = await this.perseByKuromoji(text)
      let data = {}
      let id = 0
      let sentence = ''
      let syugo = [] // 主語の集合
      let zyutugo = [] // 述語の集合
      let word = '' // 主語
      let word2 = '' // 述語1
      let word3 = '' // 述語2
      let sf = ''
      let pos = ''
      // let bf = ''
      let verb = false // 直前が動詞か否かのフラグ
      let adjective = false // 直前が形容詞か否かのフラグ
      for (let i = 0; i < tokens.length; i++) {
        console.log(tokens[i])
        sf = tokens[i].surface_form
        pos = tokens[i].pos
        // bf = tokens[i].basic_form
        sentence += sf
        /* 主語を判定しつつ抽出する処理
          (は，が以外の助詞) + (は，が以外の文字) + (は，が)
          を述語判定の形として，（は，が以外の助詞）を無視して
          （は，が）が来たタイミングで主語として抽出していく
        */
        if ((sf === ('が')) || (sf === ('は'))) {
          if (word.length !== 0) {
            word += sf
            syugo.push({ word, id: syugo.length })
          }
          word = ''
        } else if (func.isZyoshi(sf)) {
          word = ''
        } else if (pos === '名詞') {
          word += sf
        } else {
          word = ''
        }
        /* 述語を判定しつつ抽出する処理
          （は，が以外の文字）＋（動詞）＋（動詞以外）
          を述語判定の形として，動詞ー＞動詞以外がきたタイミングで
          述語として抽出していく
        */
        if (pos === '動詞') {
          // if (bf === 'する') {
          //   word2 += sf
          // } else {
          //   word2 += sf
          // }
          word2 += sf
          verb = true
        } else if (verb && (pos !== '動詞')) {
          if ((pos === '助詞') || (pos === '助動詞')) { // 「～している」のパターン.
            word2 += sf
            verb = true
          } else { // 動詞の間に助動詞を含まないパターン.
            // 名詞の場合は「～する名詞」のように名詞の就職後の可能性が高いため．
            if ((pos !== '名詞') && (pos !== '記号')) {
              zyutugo.push({ word: word2, id: zyutugo.length })
            } else if (sf === '*') {
              zyutugo.push({ word: word2, id: zyutugo.length })
            }
            word2 = ''
            verb = false
          }
        } else if ((sf === ('が')) || (sf === ('は'))) {
          word2 = ''
          verb = false
        } else if ((sf === ',') || (sf === '，')) {
          word2 = ''
          verb = false
        } else if (func.isZyoshi(sf)) {
          word2 = ''
          verb = false
        } else {
          word2 += sf
          verb = false
        }
        // 述語パターン2 形容詞の抽出
        if (pos === '形容詞') {
          word3 = sf
          adjective = true
        } else if (adjective) {
          if ((pos === '助詞') || (pos === '助動詞')) {
            word3 += sf
          } else {
            zyutugo.push({ word: word3, id: zyutugo.length })
            word3 = ''
          }
          adjective = false
        }
        if (tokens[i].surface_form.match(/\*/)) {
          console.log(sf)
          data.id = id
          data.sentence = sentence.slice(0, sentence.length - 1)
          data.syugo = syugo
          data.zyutugo = zyutugo
          // 主語，述語等で適切な文章構成になっているかを判定.
          if (func.checkLine(syugo, zyutugo)) {
            data.checkLine = true
            this.selectedDatas.push(id)
          } else {
            data.checkLine = false
          }
          this.sentences.push(data)
          data = {}
          id += 1
          sentence = ''
          syugo = []
          zyutugo = []
          word = ''
          word2 = ''
          verb = false
          adjective = false
        }
      }
      const now = new Date()
      const nowDate = String(now.getMonth() + 1) + '/' + now.getDate()
      const nowHour = (now.getHours().toString().length === 1) ? '0' + now.getHours() : now.getHours()
      const nowMin = (now.getMinutes().toString().length === 1) ? '0' + now.getMinutes() : now.getMinutes()
      const HM = nowHour + ' : ' + nowMin
      const nowTime = nowDate + '  ' + HM
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
    },
    saveSelectedDatas () {
      console.log(this.selectedDatas)
    }
  }
}
</script>
<style scoped>

</style>
