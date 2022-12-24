<template>
  <v-row justify="center" align="center">
    <v-col cols="auto">
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
              outlined
              name="input-7-4"
              :value="text"
              :height="Dheight"
            ></v-textarea>
          <v-btn block @click="analysis">解析</v-btn>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import Encoding from 'encoding-japanese'

export default {
  name: 'IndexPage',
  data () {
    return {
      file: null,
      encoding: '',
      text: '',
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
          .then(text => console.log(text))
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
          this.text = unicodeString
          resolve(unicodeString)
        }
        reader.onerror = error => reject(error)
        reader.readAsArrayBuffer(file)
      })
    },
    // 文章をsplitIntoSentenceで分解して，perseSentenceで解析したものをテーブルに収める
    analysis (text) {
      console.log('analysis text')
    },
    // 文章を文末区切りで一文ごとに分解する．それを配列に格納する
    splitIntoSentence (text) {
      console.log('splitIntoSentence')
    },
    perseSentence () {
      console.log('perseSentence')
    }
  }
}
</script>
<style scoped>

</style>
