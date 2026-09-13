import { useState } from 'react'
import Header from '../sections/Header'
import Ticker from '../sections/Ticker'
import Hero from '../sections/Hero'
import Problem from '../sections/Problem'
import FitCheck from '../sections/FitCheck'
import HowItWorks from '../sections/HowItWorks'
import Lineup from '../sections/Lineup'
import CtaBanner from '../sections/CtaBanner'
import Footer from '../sections/Footer'
import FitQuiz from '../sections/FitQuiz'

export default function Home() {
  const [quizOpen, setQuizOpen] = useState(false)
  const runCheck = () => setQuizOpen(true)

  return (
    <div className="bg-ink text-paper min-h-screen">
      <Header onRunCheck={runCheck} />
      <main>
        <div className="pt-14" />
        <Ticker />
        <Hero onRunCheck={runCheck} />
        <Problem />
        <FitCheck />
        <HowItWorks />
        <Lineup />
        <CtaBanner onRunCheck={runCheck} />
        <Ticker fast />
      </main>
      <Footer />
      <FitQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />
    </div>
  )
}
