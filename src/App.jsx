import { useState, useRef, useEffect } from 'react'
import { SEED_PROPERTIES } from './data/properties.js'
import { lineOf } from './data/lines.js'
import { totalMan, mapLinkOf, embedUrlOf } from './data/helpers.js'
import './App.css'

function LineBadge({ line }) {
  const l = lineOf(line)
  return <span className="line-badge" style={{ background: l.color }} title={l.name}>{l.code}</span>
}

// 1物件＝1枚のカード（スワイプで全物件を閲覧）
function PropertyCard({ p, no, dir }) {
  const photos = p.images || []
  const [photoIdx, setPhotoIdx] = useState(0)
  const pIdx = Math.min(photoIdx, Math.max(0, photos.length - 1))
  const photo = photos[pIdx]
  const isChamp = p.status === 'applied'

  return (
    <article className={`pcard ${isChamp ? 'is-champ' : ''}`} data-dir={dir}>
      <div className="pcard-photo">
        {photo ? (
          <img
            key={`${p.id}-${pIdx}`} src={photo}
            alt={`${p.name} の写真`} loading="lazy" referrerPolicy="no-referrer"
          />
        ) : (
          <div className="pcard-noimg">🏢</div>
        )}
        <div className="pcard-scrim" />

        {photos.length > 1 && (
          <div className="photo-dots">
            {photos.map((_, i) => (
              <button
                key={i} type="button"
                className={`pdot ${i === pIdx ? 'is-on' : ''}`}
                aria-label={`写真 ${i + 1}`} onClick={() => setPhotoIdx(i)}
              />
            ))}
          </div>
        )}

        {isChamp && <span className="pcard-ribbon">👑 本命 ・ 不動の第一希望</span>}

        <div className="pcard-cap">
          <span className="pcard-no">{no}</span>
          <h2 className="pcard-name">{p.name}</h2>
        </div>
      </div>

      <div className="pcard-body">
        {p.intro && <p className="pcard-intro">“{p.intro}”</p>}

        <div className="pcard-stats">
          <div className="pstat">
            <span className="pstat-num">{totalMan(p)}<small>万</small></span>
            <span className="pstat-lbl">総額 / 月</span>
          </div>
          <div className="pstat">
            <span className="pstat-num">{p.sizeM2}<small>㎡</small></span>
            <span className="pstat-lbl">{p.layout}</span>
          </div>
          <div className="pstat">
            <span className="pstat-num">{p.floor}<small>/{p.totalFloors}階</small></span>
            <span className="pstat-lbl">築{p.chikuYears}年</span>
          </div>
        </div>

        {p.stations?.length > 0 && (
          <ul className="pcard-stations">
            {p.stations.slice(0, 3).map((s, i) => (
              <li key={i}><LineBadge line={s.line} />{s.name}<span className="st-min">{s.min}分</span></li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

export default function App() {
  const all = SEED_PROPERTIES
  const championIdx = Math.max(0, all.findIndex((p) => p.status === 'applied'))

  const [idx, setIdx] = useState(championIdx) // ①=本命からスタート
  const [dir, setDir] = useState(1)
  const [mapOpen, setMapOpen] = useState(false)
  const active = all[idx]

  const go = (d) => { setDir(d); setIdx((i) => (i + d + all.length) % all.length) }
  const jump = (i) => { setDir(i >= idx ? 1 : -1); setIdx(i) }

  // スワイプ（横）で物件を切り替え
  const touchX = useRef(null)
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1)
    touchX.current = null
  }

  // 矢印キーでも切り替え／Escでシートを閉じる
  useEffect(() => {
    const onKey = (e) => {
      if (mapOpen) { if (e.key === 'Escape') setMapOpen(false); return }
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mapOpen])

  return (
    <div className="app">
      <header className="topbar">
        <h1>二人のお部屋さがし</h1>
      </header>

      {/* 上部：スワイプ操作バー（全物件をスライド） */}
      <div className="deck-nav">
        <button className="nav-btn" onClick={() => go(-1)} aria-label="前の物件">‹</button>
        <div className="dots">
          {all.map((p, i) => (
            <button
              key={p.id} type="button"
              className={`dot ${i === idx ? 'is-on' : ''} ${p.status === 'applied' ? 'dot--champ' : ''}`}
              aria-label={`${i + 1}件目 ${p.name}`} onClick={() => jump(i)}
            />
          ))}
        </div>
        <button className="nav-btn" onClick={() => go(1)} aria-label="次の物件">›</button>
      </div>

      {/* 1物件＝1枚のカード */}
      <div className="deck" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <PropertyCard key={active.id} p={active} no={idx + 1} dir={dir} />

        <div className="deck-actions">
          <button className="btn btn--map" onClick={() => setMapOpen(true)}>🗺️ 地図を見る</button>
          {active.homesUrl && (
            <a className="btn" href={active.homesUrl} target="_blank" rel="noreferrer">物件ページ</a>
          )}
        </div>

        <p className="deck-hint">← スワイプ / ボタンで {all.length}件を切り替え →</p>
      </div>

      {/* 地図：下からせり上がるシート */}
      {mapOpen && (
        <div className="sheet-backdrop" onClick={() => setMapOpen(false)}>
          <div className="sheet" role="dialog" aria-label={`${active.name} の地図`} onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grip" />
            <div className="sheet-head">
              <span className="sheet-title">📍 {active.name}</span>
              <button className="sheet-close" onClick={() => setMapOpen(false)} aria-label="閉じる">✕</button>
            </div>
            <iframe
              key={active.id} className="sheet-map" title={`${active.name} の地図`} loading="lazy"
              src={embedUrlOf(active)} referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="sheet-info">
              {active.address && (
                <p className="map-addr">
                  {active.address}
                  {active.floor && active.totalFloors && <span className="map-floor">🏢 {active.floor}階/{active.totalFloors}階建</span>}
                </p>
              )}
              {active.stations?.length > 0 && (
                <ul className="map-stations">
                  {active.stations.slice(0, 3).map((s, i) => (
                    <li key={i} style={{ '--d': `${i * 60}ms` }}><LineBadge line={s.line} />{s.name}<span className="st-min">{s.min}分</span></li>
                  ))}
                </ul>
              )}
              <div className="map-actions">
                <a className="btn" href={mapLinkOf(active)} target="_blank" rel="noreferrer">🗺️ 大きな地図で開く</a>
                {active.homesUrl && <a className="btn" href={active.homesUrl} target="_blank" rel="noreferrer">物件ページ</a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
