import { useState, useEffect } from 'react'
import axios from 'axios'
import { Brain } from 'lucide-react'
import InputSection from './components/InputSection'
import ResultsSection from './components/ResultsSection'
import ProgressBar from './components/ProgressBar'

function App() {
  const [vocText, setVocText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')

  const simulateProgress = () => {
    setProgress(0)
    setStatus('Initializing agents...')

    const steps = [
      { p: 10, s: 'Analyzing research goal...' },
      { p: 30, s: 'Summarizing feedback...' },
      { p: 50, s: 'Generating insights...' },
      { p: 70, s: 'Drafting report...' },
      { p: 90, s: 'Evaluating quality...' }
    ]

    let currentStep = 0

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p)
        setStatus(steps[currentStep].s)
        currentStep++
      } else {
        clearInterval(interval)
      }
    }, 800) // Updates every 800ms to simulate work

    return interval
  }

  const handleAnalyze = async () => {
    if (!vocText.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    const progressInterval = simulateProgress()

    try {
      const response = await axios.post('http://localhost:8000/analyze', { text: vocText })

      clearInterval(progressInterval)
      setProgress(100)
      setStatus('Analysis complete')

      // Add a small delay before showing results to let the bar finish
      setTimeout(() => {
        setResults(response.data)
        setLoading(false)
      }, 500)

    } catch (err) {
      clearInterval(progressInterval)
      setError(err.message || 'An error occurred during analysis')
      setLoading(false)
      setStatus('Error occurred')
    }
  }

  return (
    <div className="min-h-screen text-white p-6">
      <header className="max-w-4xl mx-auto mb-12 text-center pt-8">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
          <Brain size={32} />
        </div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ResearchOps LLM Agent Pipeline
        </h1>
        <p className="text-slate-400">Automated VOC Analysis & Insight Generation</p>
      </header>

      <main className="max-w-3xl mx-auto space-y-8 pb-20">
        <InputSection
          value={vocText}
          onChange={setVocText}
          onAnalyze={handleAnalyze}
          loading={loading}
        />

        {(loading || results) && (
          <ProgressBar progress={progress} status={status} />
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center">
            {error}
          </div>
        )}

        {results && <ResultsSection results={results} />}
      </main>
    </div>
  )
}

export default App
