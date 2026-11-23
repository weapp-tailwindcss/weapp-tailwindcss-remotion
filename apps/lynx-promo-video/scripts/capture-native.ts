import type { CaptureManifest, CapturePlatform, SourceSnapshot } from './capture/manifest'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { parseCaptureOptions } from './capture-options'
import { digestFile, manifestRelativePath, readCaptureManifest, snapshotSources, writeCaptureManifest } from './capture/manifest'
import { allocateCaptureOutput, preservePublishedCapture } from './capture/output'
import { appRoot, publicDir, repoRoot } from './paths'

async function command(name: string, args: string[], cwd: string, timeout = 1_800_000) {
  const result = await execa(name, args, { all: true, cwd, reject: false, timeout })
  if (result.exitCode !== 0) {
    throw new Error(`${name} ${args.join(' ')} failed:\n${result.all ?? result.stderr ?? result.stdout ?? result.shortMessage}`)
  }
  return result.all ?? ''
}

async function capture(platform: CapturePlatform, bundlePath: string, source: SourceSnapshot, runnerRoot: string) {
  const captureRoot = path.join(appRoot, '.capture')
  const { runDir, rawDir } = await allocateCaptureOutput(captureRoot, platform)
  const captureDir = path.join(publicDir, 'captures')
  await fs.mkdir(captureDir, { recursive: true })
  await command('pnpm', [
    'exec',
    'tsx',
    'e2e/lynx/run-native.ts',
    platform,
    '--capture-only',
    '--bundle',
    bundlePath,
    '--assets',
    path.dirname(bundlePath),
    '--output',
    rawDir,
    '--duration',
    '18',
    ...(platform === 'ios' ? ['--scroll'] : []),
  ], runnerRoot)

  const videoPath = path.join(runDir, `${platform}.mp4`)
  const coverPath = path.join(runDir, `${platform}-cover.png`)
  await command('ffmpeg', [
    '-n',
    '-i',
    path.join(rawDir, 'raw.mp4'),
    '-an',
    '-vf',
    'fps=30,scale=720:-2:flags=lanczos',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '22',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    videoPath,
  ], appRoot)
  await command('ffmpeg', [
    '-n',
    '-ss',
    '1',
    '-i',
    videoPath,
    '-frames:v',
    '1',
    coverPath,
  ], appRoot)

  const manifestFile = path.resolve(process.env.LYNX_PROMO_CAPTURE_MANIFEST ?? path.join(captureDir, 'manifest.json'))
  const previous = await fs.stat(manifestFile).catch(() => undefined)
  const manifest: CaptureManifest = previous
    ? await readCaptureManifest(manifestFile)
    : { version: 1, createdAt: new Date().toISOString(), source, platforms: {} }
  const publishedVideo = path.join(captureDir, `${platform}.mp4`)
  const publishedCover = path.join(captureDir, `${platform}-cover.png`)
  await preservePublishedCapture([publishedVideo, publishedCover, manifestFile], captureRoot)
  await fs.copyFile(videoPath, publishedVideo)
  await fs.copyFile(coverPath, publishedCover)
  const device = JSON.parse(await fs.readFile(path.join(rawDir, 'device.json'), 'utf8')) as Record<string, unknown>
  const stagedBundle = await digestFile(path.join(rawDir, 'main.lynx.bundle'))
  const assetRoot = path.join(rawDir, 'capture-assets')
  const assetManifest = JSON.parse(await fs.readFile(path.join(rawDir, 'capture-assets.json'), 'utf8')) as { files: Array<{ name: string, sha256: string }> }
  const assets = await Promise.all(assetManifest.files.map(async (asset) => {
    // 这里的 name 是扫描层生成的 bundler 资产名，不是文件系统路径。
    const file = await digestFile(path.join(assetRoot, ...asset.name.split('/')))
    if (file.sha256 !== asset.sha256) {
      throw new Error(`本轮原生图片归档摘要不一致：${asset.name}`)
    }
    return { ...file, path: manifestRelativePath(manifestFile, file.path) }
  }))
  manifest.createdAt = new Date().toISOString()
  manifest.source = { ...source, root: manifestRelativePath(manifestFile, source.root) }
  manifest.platforms[platform] = {
    device,
    runtime: `e2e/lynx/run-native.ts ${platform} --capture-only (runner via --repo)`,
    sourceSha256: source.sha256,
    rawVideo: manifestRelativePath(manifestFile, path.join(rawDir, 'raw.mp4')),
    video: manifestRelativePath(manifestFile, publishedVideo),
    cover: manifestRelativePath(manifestFile, publishedCover),
    bundle: { ...stagedBundle, path: manifestRelativePath(manifestFile, stagedBundle.path) },
    ...(assets.length ? { assets, assetsRoot: manifestRelativePath(manifestFile, assetRoot) } : {}),
  }
  await writeCaptureManifest(manifestFile, manifest)
  process.stdout.write(`${JSON.stringify({ platform, rawDir, manifestFile }, null, 2)}\n`)
}

async function main() {
  const options = parseCaptureOptions(process.argv.slice(2), process.env.LYNX_REPO)
  const exampleRoot = path.join(repoRoot, 'apps', 'react-lynx-promo')
  const source = await snapshotSources(exampleRoot)
  await command('pnpm', ['--filter', '@weapp-tailwindcss/example-react-lynx-promo', 'build'], repoRoot)
  const bundlePath = path.join(exampleRoot, 'dist', 'main.lynx.bundle')
  for (const platform of options.platforms) {
    await capture(platform, bundlePath, source, options.repositoryRoot)
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
