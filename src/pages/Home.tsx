import { useState } from 'react'
import Navbar from '../sections/Navbar'
import Hero from '../sections/Hero'
import Contests from '../sections/Contests'
import Workspace from '../sections/Workspace'
import Pipeline from '../sections/Pipeline'
import About from '../sections/About'
import Messages from '../sections/Messages'
import Sponsor from '../sections/Sponsor'
import Footer from '../sections/Footer'
import Reveal from '../components/Reveal'
import type { ContestId } from '../lib/workflow'

export default function Home() {
  const [contest, setContest] = useState<ContestId>('cumcm')

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <Navbar />
      <Hero />
      <Reveal>
        <Contests selected={contest} onSelect={setContest} />
      </Reveal>
      <Reveal>
        <Workspace contest={contest} onContestChange={setContest} />
      </Reveal>
      <Reveal>
        <Pipeline />
      </Reveal>
      <Reveal>
        <About />
      </Reveal>
      <Reveal>
        <Messages />
      </Reveal>
      <Reveal>
        <Sponsor />
      </Reveal>
      <Footer />
    </div>
  )
}
