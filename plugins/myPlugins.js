const zyoshi = [
  'では',
  'より',
  'へ',
  'から',
  'の',
  'には',
  'によると',
  'するが',
  'で',
  'を',
  'も'
]

export const isZyoshi = (word) => {
  for (let i = 0; i < zyoshi.length; i++) {
    if (zyoshi[i] === word) {
      return true
    }
  }
  return false
}

export const checkLine = (syugo, zyutugo) => {
  let flag = true
  if ((syugo.length === 0) || (zyutugo.length === 0)) {
    flag = false
  }
  // ここはもう少し改良した方がよい.
  console.log(syugo)
  for (let i = 0; i < syugo.length; i++) {
    if (syugo[i].word === 'nothing') {
      flag = false
    }
  }
  for (let i = 0; i < zyutugo.length; i++) {
    if (zyutugo[i].word === 'nothing') {
      flag = false
    }
  }
  return flag
}

export const test = () => {
  return true
}
