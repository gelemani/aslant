'use client'

import type { ReactNode } from 'react'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { StageRoot } from '@/webgl/StageRoot'
import { Loader } from '@/components/Loader'
import { Nav } from '@/components/Nav'
import { Menu } from '@/components/Menu'
import { KeyLayer } from '@/components/KeyLayer'
import { RayOverlay } from '@/components/RayOverlay'

/**
 * The one client shell (7.2): SmoothScroll (owns the ticker), StageRoot, Loader, Nav,
 * Menu, KeyLayer and RayOverlay, then the server-rendered sections as children.
 */
export function Experience({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <StageRoot />
      <Loader />
      <Nav />
      <Menu />
      <KeyLayer />
      <RayOverlay />
      {children}
    </SmoothScroll>
  )
}

export default Experience
