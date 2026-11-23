import path from 'node:path'

export type Platform = 'android' | 'ios'

interface CaptureOptions {
  platforms: Platform[]
  repositoryRoot: string
}

function platformsFromArgument(argument: string | undefined): Platform[] {
  if (!argument || argument === 'all') {
    return ['android', 'ios']
  }
  if (argument === 'android' || argument === 'ios') {
    return [argument]
  }
  throw new Error('Usage: tsx scripts/capture-native.ts [android|ios|all] --repo <weapp-tailwindcss-checkout>')
}

export function parseCaptureOptions(args: string[], repositoryFromEnvironment?: string): CaptureOptions {
  let platformArgument = 'all'
  let repositoryArgument = repositoryFromEnvironment
  let readRepositoryArgument = false

  for (const argument of args) {
    if (readRepositoryArgument) {
      repositoryArgument = argument
      readRepositoryArgument = false
      continue
    }
    if (argument === '--repo') {
      readRepositoryArgument = true
      continue
    }
    if (argument === 'android' || argument === 'ios' || argument === 'all') {
      platformArgument = argument
      continue
    }
    throw new Error('Usage: tsx scripts/capture-native.ts [android|ios|all] --repo <weapp-tailwindcss-checkout>')
  }

  if (readRepositoryArgument || !repositoryArgument) {
    throw new Error('Provide --repo or LYNX_REPO with a weapp-tailwindcss checkout for the Lynx demo and native runner.')
  }

  return {
    platforms: platformsFromArgument(platformArgument),
    repositoryRoot: path.resolve(repositoryArgument),
  }
}
