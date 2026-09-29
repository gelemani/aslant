import Link from 'next/link'

// The 404 is the room with the window shut: no canvas, no loader, no skip link, no light at all.
// Its few rules travel with it as a hoisted <style> (React 19 `href` + `precedence`), so no
// stylesheet for this page is preloaded on every other route.
const CSS = `/* The unlit room: plain limewash in shade, a skirting board at the foot of the wall (6.1.4). */
.nf-room {
  position: relative;
  min-height: 100svh;
  background: var(--c-shade);
  color: var(--c-lime);
  display: flex;
  flex-direction: column;
  overflow: clip;
}

.nf-bar {
  height: var(--nav-h);
  padding-inline: var(--margin);
  display: flex;
  align-items: center;
}

.nf-wordmark {
  color: var(--c-lime);
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.nf-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-inline: var(--margin);
  /* the text sits above the skirting board (which starts at 96.5% of the viewport) */
  padding-bottom: calc(3.5svh + var(--sp-9));
  padding-top: var(--sp-8);
}

.nf-title {
  --h2-wdth: 150%;
  --h2-wdth-sm: 124%;
  margin: 0 0 var(--sp-5);
  max-width: 16ch;
  color: var(--c-lime);
}

.nf-back {
  margin: 0;
}

.nf-link {
  color: var(--c-lime);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.22em;
  text-decoration-color: var(--c-dust);
  transition: text-decoration-color var(--dur-tick) linear;
}
.nf-link:hover { text-decoration-color: var(--c-sun); }

/* Skirting: board albedo x 0.92 below y = 96.5%, a 1 px highlight on its top edge,
   and a 6 px soft contact shadow on the wall just above it. */
.nf-skirting {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3.5svh;
  background: #383E3F;
  border-top: 1px solid #3D4445;
}
.nf-skirting::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 1px);
  height: 6px;
  background: linear-gradient(to bottom, rgb(0 0 0 / 0), rgb(0 0 0 / 0.1));
}

@media (min-width: 768px) {
  .nf-title { max-width: 20ch; }
}`

export default function NotFound() {
  return (
    <div className="nf-room">
      <style href="aslant-not-found" precedence="default">
        {CSS}
      </style>
      <header className="nf-bar">
        <Link href="/" className="t-wordmark nf-wordmark">
          aslant
        </Link>
      </header>
      <main className="nf-main">
        <h1 className="t-h2 nf-title">No light reaches this page.</h1>
        <p className="t-lead nf-back">
          <Link href="/" className="nf-link">
            Back to the window.
          </Link>
        </p>
      </main>
      <div className="nf-skirting" aria-hidden="true" />
    </div>
  )
}
