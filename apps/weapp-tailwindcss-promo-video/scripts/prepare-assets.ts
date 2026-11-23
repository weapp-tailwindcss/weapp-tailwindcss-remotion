import fs from 'node:fs/promises'
import path from 'node:path'
import QRCode from 'qrcode'
import { DOCS_URL } from '../src/config'
import { publicDir } from './paths'

const brandDir = path.join(publicDir, 'brand')
await fs.mkdir(brandDir, { recursive: true })
await QRCode.toFile(path.join(brandDir, 'docs-qr.png'), DOCS_URL, { width: 640, margin: 3, errorCorrectionLevel: 'H', color: { dark: '#040D1AFF', light: '#FFFFFFFF' } })
console.log('官网二维码已准备。品牌素材已随工程纳入版本管理。')
