<template>
  <v-row>
    <v-col class="text-center">
      <v-alert border="left" colored-border color="blue lighten-1" elevation="2">
        <div class="text-h5">一時保存されているデータ一覧</div>
        <div class="text-caption">※リロード，タブを閉じる等の処理で一時データはなくなります</div>
      </v-alert>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                タイトル
              </th>
              <th class="text-left">
                保存した時間
              </th>
              <th class="text-left">
                このデータへ
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in saveList"
              :key="item.time"
              @click="goToHome(item.text.text, item.id)"
            >
              <td class="text-left">{{ item.text.title }}</td>
              <td class="text-left">{{ item.text.time }}</td>
              <td class="text-left">
                <v-btn text color='blue lighten-1'>
                  <v-icon>mdi-arrow-right-bold</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'InspirePage',
  data () {
    return {
      saveList: []
    }
  },
  mounted () {
    this.saveList = this.$store.state.saveList
  },
  methods: {
    async goToHome (text, id) {
      await this.$store.commit('addNowData', {
        nowData: text
      })
      await this.$store.commit('addNowID', id)
      console.log(id)
      this.$router.push('/')
    }
  }
}
</script>
