import { BUDGET_MAN } from './properties.js'

export function totalMan(p) {
  return Math.round((p.rentMan + p.mgmtMan) * 100) / 100
}
export function withinBudget(p) {
  return totalMan(p) <= BUDGET_MAN
}
export function minWalk(p) {
  return Math.min(...p.stations.map((s) => s.min))
}
// 賃料単価（円/㎡）：割安さの比較に使う。管理費込みの総額ベース。
export function pricePerM2(p) {
  if (!p.sizeM2) return null
  return Math.round((totalMan(p) * 10000) / p.sizeM2)
}

// 一覧の中での「最安・最広・駅近・築浅・割安」を判定して各物件にバッジ配列を付ける
export function superlatives(props) {
  const map = {}
  if (!props.length) return map
  const minOf = (list, fn) => list.reduce((a, b) => (fn(b) < fn(a) ? b : a))
  const maxOf = (list, fn) => list.reduce((a, b) => (fn(b) > fn(a) ? b : a))
  const push = (id, badge) => { (map[id] ||= []).push(badge) }
  push(minOf(props, totalMan).id, { key: 'cheap', label: '最安', icon: '💰' })
  push(maxOf(props, (p) => p.sizeM2 || 0).id, { key: 'wide', label: '最広', icon: '📐' })
  push(minOf(props, minWalk).id, { key: 'near', label: '駅近', icon: '🚶' })
  push(minOf(props, (p) => p.chikuYears ?? 999).id, { key: 'new', label: '築浅', icon: '✨' })
  const withPrice = props.filter((p) => pricePerM2(p) != null)
  if (withPrice.length) push(minOf(withPrice, pricePerM2).id, { key: 'value', label: '割安', icon: '⚖️' })
  return map
}
// アクセススコア（0-100）：最寄り徒歩分・徒歩5分圏の駅数・乗換なし路線から算出
export function accessScore(p) {
  const walk = minWalk(p)
  const walkScore = Math.max(0, 100 - (walk - 1) * 9)
  const near = p.stations.filter((s) => s.min <= 5).length
  const directBonus = (p.directTags?.length || 0) * 4
  const hubBonus = (p.hubs?.filter((h) => h.transfers === 0).length || 0) * 3
  return Math.min(100, Math.round(walkScore * 0.6 + near * 8 + directBonus + hubBonus))
}
export function stars(score) {
  return Math.max(1, Math.round((score / 100) * 5))
}

const enc = encodeURIComponent
// カードで開く地図リンク（物件が指定していればそれを優先）
export function mapLinkOf(p) {
  return p.mapLink || `https://www.google.com/maps/search/?api=1&query=${enc(p.name + ' ' + p.address)}`
}
// 出発地=物件、目的地は空欄→Googleマップ側で通勤先を入力
export function routeUrl(p) {
  return `https://www.google.com/maps/dir/?api=1&origin=${enc(p.address)}&destination=`
}
// カード内に埋め込む操作できる地図（APIキー不要のembed）
export function mapEmbedUrl(p) {
  return `https://www.google.com/maps?q=${enc(p.address || p.name)}&z=16&hl=ja&output=embed`
}

// 近隣を1枚で見せるGoogleマップ埋め込み（キー不要）。第一希望（なければ先頭）を中心にピン表示
export function overviewEmbedUrl(props) {
  const p = props.find((x) => x.status === 'applied') || props[0]
  if (!p) return ''
  const center = (p.lat && p.lng) ? `${p.lat},${p.lng}` : (p.address || p.name)
  return `https://www.google.com/maps?q=${enc(center)}&z=15&hl=ja&output=embed`
}
// 3件まとめて本物のGoogleマップで開くリンク（複数ピン＝相対的な位置関係が見える）
export function googleAllUrl(props) {
  const pts = props.filter((x) => (x.lat && x.lng) || x.address)
    .map((x) => (x.lat && x.lng) ? `${x.lat},${x.lng}` : x.address)
  if (!pts.length) return 'https://www.google.com/maps'
  if (pts.length === 1) return `https://www.google.com/maps/search/?api=1&query=${enc(pts[0])}`
  return 'https://www.google.com/maps/dir/' + pts.map(enc).join('/')
}

// 特定の物件を中心にピン表示するGoogleマップ埋め込み（座標優先・キー不要）
// z=15：中心から上下約850m入るので、春日・後楽園などの最寄り駅も画面内に収まる
export function embedUrlOf(p) {
  if (!p) return ''
  const c = (p.lat && p.lng) ? `${p.lat},${p.lng}` : (p.address || p.name)
  return `https://www.google.com/maps?q=${enc(c)}&z=15&hl=ja&output=embed`
}
