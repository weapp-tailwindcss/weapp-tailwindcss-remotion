import { describe, expect, it } from 'vitest'
import { parseCaptureOptions } from './capture-options'

describe('native capture options', () => {
  it('uses the explicit repository and captures both platforms by default', () => {
    expect(parseCaptureOptions(['--repo', '/workspace/weapp-tailwindcss'])).toEqual({
      platforms: ['android', 'ios'],
      repositoryRoot: '/workspace/weapp-tailwindcss',
    })
  })

  it('accepts a selected platform and the LYNX_REPO fallback', () => {
    expect(parseCaptureOptions(['ios'], '/workspace/weapp-tailwindcss')).toEqual({
      platforms: ['ios'],
      repositoryRoot: '/workspace/weapp-tailwindcss',
    })
  })

  it('requires a repository path and rejects unknown options', () => {
    expect(() => parseCaptureOptions([])).toThrow('Provide --repo or LYNX_REPO')
    expect(() => parseCaptureOptions(['--other'], '/workspace/weapp-tailwindcss')).toThrow('Usage:')
    expect(() => parseCaptureOptions(['--repo'])).toThrow('Provide --repo or LYNX_REPO')
  })
})
