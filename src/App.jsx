import { useState } from 'react'
import { SEED_PROPERTIES } from './data/properties.js'
import { lineOf } from './data/lines.js'
import { totalMan, mapLinkOf, embedUrlOf } from './data/helpers.js'
import './App.css'

function LineBadge({ line }) {
  const l = lineOf(line)
  return <span className="line-badge" style={{ background: l.color }} title={l.name}>{l.code}</span>
}

function PropertyCard({ p, no, active, onSelect }) {
  const total = totalMan(p)
  return (
    <article
      className={`card ${p.status === 'applied' ? 'is-applied' : ''} ${active ? 'is-active' : ''}`}
      onClick={() => onSelect(p.id)}
    >
      {p.status === 'applied' && <span className="tag-applied">第一希望</span>}
      <div className="card-top">
        <span className="pin-no">{no}</span>
        <h2 className="card-name">{p.name}</h2>
      </div>

      {p.intro && <p className="intro">“{p.intro}”</p>}

      <div className="card-foot">
        <span className="rent">{total}<small>万</small></span>
        <span className="spec">{p.sizeM2}㎡・{p.layout}・築{p.chikuYears}年</span>
        {p.floor && p.totalFloors && (
          <span className="floor">🏢 {p.floor}階<small>/{p.totalFloors}階建</small></span>
        )}
      </div>
    </article>
  )
}

export default function App() {
  const all = SEED_PROPERTIES
  const [activeId, setActiveId] = useState(
    () => (all.find((p) => p.status === 'applied') || all[0])?.id,
  )
  const active = all.find((p) => p.id === activeId) || all[0]

  return (
    <div className="app">
      <header className="topbar">
        <h1>二人のお部屋さがし</h1>
      </header>

      <div className="mapzone">
        <div className="map-frame">
          <iframe
            className="gmap" title={`${active?.name || '候補エリア'} の地図`} loading="lazy"
            src={embedUrlOf(active)} referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-caption">
            <div className="map-cap-main">
              <span className="map-dot" />
              <b>{active?.name}</b>
            </div>
            {active?.address && (
              <p className="map-addr">
                {active.address}
                {active.floor && active.totalFloors && <span className="map-floor">🏢 {active.floor}階/{active.totalFloors}階建</span>}
              </p>
            )}
            {active?.stations?.length > 0 && (
              <ul className="map-stations">
                {active.stations.slice(0, 3).map((s, i) => (
                  <li key={i}><LineBadge line={s.line} />{s.name}<span className="st-min">{s.min}分</span></li>
                ))}
              </ul>
            )}
            <div className="map-actions">
              {active && <a className="btn" href={mapLinkOf(active)} target="_blank" rel="noreferrer">🗺️ この物件の地図</a>}
              {active?.homesUrl && <a className="btn" href={active.homesUrl} target="_blank" rel="noreferrer">物件ページ</a>}
            </div>
          </div>
        </div>
      </div>

      <main className="grid">
        {all.map((p, i) => (
          <PropertyCard key={p.id} p={p} no={i + 1} active={active?.id === p.id} onSelect={setActiveId} />
        ))}
      </main>
    </div>
  )
}
