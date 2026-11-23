import { availableParallelism } from 'node:os'

export const workspaceMaxWorkers = Math.min(4, availableParallelism())
