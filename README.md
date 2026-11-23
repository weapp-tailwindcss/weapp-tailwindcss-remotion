# weapp-tailwindcss Remotion videos

此仓库维护 weapp-tailwindcss 的两套 Remotion 宣传片工程：

- `apps/weapp-tailwindcss-promo-video` 提供中文和英文横版、竖版宣传片。
- `apps/lynx-promo-video` 提供 ReactLynx 集成的中文和英文宣传片。

## 环境

需要 Node.js `^22.23.4 || ^24.22.1 || >=26.12.1`、pnpm `12.21.0`、`ffmpeg`、`ffprobe` 和 `uvx`。

克隆仓库后在根目录安装依赖：

```bash
pnpm install --frozen-lockfile
```

## 工程

各工程的素材准备、字幕、声音、预览、渲染与验证说明见对应 README：

- [产品宣传片](apps/weapp-tailwindcss-promo-video/README.md)
- [Lynx 宣传片](apps/lynx-promo-video/README.md)

Lynx 工程的原生录屏流程使用本仓库内的 ReactLynx 示例，并调用主仓库中的原生运行器。使用 `capture` 时，需通过 `--repo` 指向已安装依赖的 `weapp-tailwindcss` 仓库 checkout。
