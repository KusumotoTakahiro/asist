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
  if (syugo.length !== zyutugo.length) {
    flag = false
  }
  return flag
}

export const test = () => {
  return true
}
