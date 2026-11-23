import type { EvidenceSummary, PromoCopy } from '../config'
import { interpolate, useCurrentFrame } from 'remotion'
import { eyebrowStyle, SceneShell } from '../components/SceneShell'
import { COLORS } from '../config'

export function EvidenceScene({ evidence, copy }: { evidence: EvidenceSummary, copy: PromoCopy['evidence'] }) {
  const frame = useCurrentFrame()
  const imageOpacity = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <SceneShell style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 72, alignItems: 'center' }}>
      <div>
        <div style={eyebrowStyle}>{copy.eyebrow}</div>
        <h2 style={{ margin: '18px 0 24px', fontSize: 64, lineHeight: 1.12, fontWeight: 720, letterSpacing: 0 }}>
          {evidence.total}
          {' '}
          {copy.title[0]}
          <br />
          {copy.title[1]}
        </h2>
        <div style={{ color: COLORS.muted, fontSize: 20, lineHeight: 1.65 }}>
          Tailwind CSS
          {evidence.versions.tailwindcss}
          <br />
          Lynx Engine
          {' '}
          {evidence.versions.lynxEngine}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 44 }}>
          {copy.cards.map(({ label, detail }, index) => (
            <div key={label} style={{ padding: '22px 18px', borderTop: `2px solid ${index === 2 ? COLORS.green : COLORS.blue}`, background: COLORS.surface }}>
              <div style={{ fontSize: 21, fontWeight: 680 }}>{label}</div>
              <div className="mono" style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>{detail}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', height: 710, overflow: 'hidden', border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, opacity: imageOpacity }}>
        <div style={{ padding: 34, fontFamily: 'JetBrains Mono, monospace', color: COLORS.muted, fontSize: 16, letterSpacing: 1 }}>
          COMPATIBILITY LAB
          <div style={{ marginTop: 10, color: COLORS.text, fontSize: 20, letterSpacing: 0 }}>双端报告 · {evidence.verifiedAt.slice(0, 10)}</div>
          <div style={{ marginTop: 34, display: 'grid', gap: 24 }}>
            {[
              { label: 'SUPPORTED', value: evidence.supported, color: COLORS.green },
              { label: 'LIMITED', value: evidence.unsupported, color: COLORS.blue },
              { label: 'PLATFORM DIFF', value: evidence.platformDifferences, color: COLORS.muted },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: item.color }}><span>{item.label}</span><span>{String(item.value).padStart(3, '0')}</span></div>
                <div style={{ height: 12, marginTop: 10, background: COLORS.border }}><div style={{ width: `${Math.max(4, item.value / evidence.total * 100)}%`, height: '100%', background: item.color }} /></div>
              </div>
            ))}
          </div>
          <div style={{ position: 'absolute', left: 34, right: 34, bottom: 34, paddingTop: 20, borderTop: `1px solid ${COLORS.border}`, color: '#cbd7d4', fontFamily: 'Noto Sans SC, sans-serif', fontSize: 17, lineHeight: 1.55, letterSpacing: 0 }}>{copy.note}</div>
        </div>
      </div>
    </SceneShell>
  )
}
