import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('remotion', () => ({
  AbsoluteFill: 'div',
  interpolate: (_frame: number, _input: number[], output: number[]) => output[1],
  useCurrentFrame: () => 30,
}))

import { getPromoCopy } from '../config'
import { EvidenceScene } from './EvidenceScene'

describe('evidence scene', () => {
  it('renders its report panel without an external compatibility screenshot', () => {
    const markup = renderToStaticMarkup(createElement(EvidenceScene, {
      evidence: {
        total: 118,
        supported: 53,
        unsupported: 64,
        platformDifferences: 1,
        verifiedAt: '2026-11-16T09:37:34.566Z',
        versions: { tailwindcss: '4.3.5', lynxEngine: '4.0.1' },
      },
      copy: getPromoCopy('en').evidence,
    }))

    expect(markup).toContain('COMPATIBILITY LAB')
    expect(markup).toContain('SUPPORTED')
    expect(markup).toContain('LIMITED')
    expect(markup).not.toContain('compatibility-lab.png')
  })
})
