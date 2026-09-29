import { notFound } from 'next/navigation'
import Harness from './harness'

// G1 harness (brief 6.1.7): the hero with the baked aslant.bin, the real compositor, a debug
// panel and a stats overlay. Development only.
export default function DevLightPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <Harness />
}
