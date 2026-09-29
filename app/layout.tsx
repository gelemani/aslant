import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { sprat, geologica, geologicaExt } from './fonts'
import './globals.css'

const TITLE = 'Aslant · Clear glass that writes in sunlight'
const DESCRIPTION =
  'A proposal for a studio that shapes window panes so the sun spells a word on your wall at the hour you choose.'

/* Absolute URLs (og:image, icons) resolve against this. Set NEXT_PUBLIC_SITE_URL for the deployed build;
   on Vercel the production domain is used when it is unset, and localhost only as the last resort. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')

/* og:image and its alt come from app/opengraph-image.png and .alt.txt (file convention, captured from ?still=og). */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, siteName: 'Aslant', type: 'website', locale: 'en' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#3A4142',
}

/* Runs before first paint (4.11). Writes html data-* attributes only, never a class,
   so a client re-render of the root cannot wipe them (7.2). It also starts the hero's light data
   (4.4: 0.4 of the boot) unless WebGL is off; WP3's loadBaked('aslant') consumes
   window.__aslantBin. This replaces ReactDOM.preload: WebKit never hands an as=fetch preload to
   fetch() and downloads the file twice (06:40 decision, ORCH informed). */
const HEAD_SCRIPT = `(function(){var d=document.documentElement,q=new URLSearchParams(location.search);d.dataset.js='';
var rm=q.get('motion')==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.motion=rm?'reduced':'full';
var w='pending';if(q.get('webgl')==='0'||!('WebGL2RenderingContext'in window)||(navigator.connection&&navigator.connection.saveData))w='off';d.dataset.webgl=w;
var t=q.get('tier');if(t==='0'||t==='2'||t==='3')d.dataset.tierForced=t;if(q.get('still'))d.dataset.still=q.get('still');
if(w!=='off'&&t!=='0')try{var b=fetch('/light/aslant.bin');b.catch(function(){});window.__aslantBin=b}catch(e){}
try{var n=performance.getEntriesByType('navigation')[0];if(location.hash||(n&&(n.type==='reload'||n.type==='back_forward')))d.dataset.intro='skip'}catch(e){}
try{if(sessionStorage.getItem('aslant:seen'))d.dataset.seen='1'}catch(e){}})();`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body className={`${sprat.variable} ${geologica.variable} ${geologicaExt.variable}`}>{children}</body>
    </html>
  )
}
