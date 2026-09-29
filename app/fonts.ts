import localFont from 'next/font/local'

export const sprat = localFont({
  src: '../src/fonts/Sprat_Variable.woff2',
  variable: '--font-sprat',
  display: 'block', // about 50 KB and preloaded: the invisible period is negligible
  weight: '10 200',
  declarations: [{ prop: 'font-stretch', value: '100% 200%' }],
  adjustFontFallback: false, // next/font would size the fallback from the default instance (wdth 100, wght 10), so wide headings would re-wrap on swap
  preload: true,
})

export const geologica = localFont({
  src: '../src/fonts/Geologica-Latin.woff2',
  variable: '--font-geologica',
  display: 'swap',
  weight: '100 900',
  preload: true,
})

export const geologicaExt = localFont({
  src: '../src/fonts/Geologica-Ext.woff2',
  variable: '--font-geologica-ext',
  display: 'swap',
  weight: '100 900',
  preload: false,
  adjustFontFallback: false, // the variable must hold the family name only (see --f-text in tokens.css)
  declarations: [{ prop: 'unicode-range', value: 'U+0100-024F, U+0370-03FF, U+0400-052F, U+1E00-1EFF' }],
})
