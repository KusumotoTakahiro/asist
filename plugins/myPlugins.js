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
