// 東京メトロ・都営などの路線カラー（アクセス表示に使用）
export const LINES = {
  丸ノ内線: { code: 'M', color: '#e60012', name: '東京メトロ丸ノ内線' },
  南北線: { code: 'N', color: '#00ada9', name: '東京メトロ南北線' },
  三田線: { code: 'I', color: '#0079c2', name: '都営三田線' },
  大江戸線: { code: 'E', color: '#b6007a', name: '都営大江戸線' },
  半蔵門線: { code: 'Z', color: '#8f76d6', name: '東京メトロ半蔵門線' },
  有楽町線: { code: 'Y', color: '#c1a470', name: '東京メトロ有楽町線' },
  銀座線: { code: 'G', color: '#ff9500', name: '東京メトロ銀座線' },
  千代田線: { code: 'C', color: '#00bb85', name: '東京メトロ千代田線' },
  JR: { code: 'JR', color: '#2e8b57', name: 'JR線' },
}

export function lineOf(name) {
  return LINES[name] || { code: '●', color: '#6b7280', name }
}
