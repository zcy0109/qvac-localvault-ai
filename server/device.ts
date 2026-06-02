import os from 'node:os'
import type { DeviceInfo } from './types.js'

export function getDeviceInfo(): DeviceInfo {
  const cpus = os.cpus()

  return {
    os: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    cpu: cpus[0]?.model ?? 'unknown',
    cpu_count: cpus.length,
    total_ram_gb: Number((os.totalmem() / 1024 ** 3).toFixed(2)),
    free_ram_gb: Number((os.freemem() / 1024 ** 3).toFixed(2)),
    node: process.version,
  }
}
