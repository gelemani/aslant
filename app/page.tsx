import { Experience } from '@/components/Experience'
import FirstLight from '@/sections/FirstLight'
import ClearGlass from '@/sections/ClearGlass'
import TheBend from '@/sections/TheBend'
import Appointment from '@/sections/Appointment'
import WriteYours from '@/sections/WriteYours'
import Ledger from '@/sections/Ledger'
import Commission from '@/sections/Commission'
import Dusk from '@/sections/Dusk'

/** Server Component (7.2): the skip link, then the one client shell around the eight chapters. */
export default function Page() {
  return (
    <>
      <a className="skip-link t-ui" href="#commission" data-jump="instant">
        Skip to the form
      </a>
      <Experience>
        <main id="main">
          <FirstLight />
          <ClearGlass />
          <TheBend />
          <Appointment />
          <WriteYours />
          <Ledger />
          <Commission />
        </main>
        <Dusk />
      </Experience>
    </>
  )
}
