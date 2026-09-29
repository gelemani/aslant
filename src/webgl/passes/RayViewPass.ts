// Ray view (brief 6.6). Cut from tonight's scope: a Pass that is never visible.
import type { Pass } from '@/webgl/pass'

export class RayViewPass implements Pass {
  init(): void {}
  visible(): boolean {
    return false
  }
  render(): void {}
  resize(): void {}
  dispose(): void {}
}

export default RayViewPass
