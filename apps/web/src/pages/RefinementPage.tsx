import { useRef, useState } from 'react'
import {
  analyzePdf,
  type RefinementAnalysisResult,
} from '../api/refinementApi'

const textareaClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'

export default function RefinementPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<RefinementAnalysisResult | null>(null)

  async function handleAnalyze() {
    if (!selectedFile) {
      setErrorMessage('Please select a PDF file before analyzing.')
      return
    }

    setAnalyzing(true)
    setErrorMessage(null)

    try {
      const result = await analyzePdf(selectedFile)
      setAnalysis(result)
    } catch (error) {
      setAnalysis(null)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Analysis failed. Please try again.',
      )
    } finally {
      setAnalyzing(false)
    }
  }

  function handleClear() {
    setSelectedFile(null)
    setAnalysis(null)
    setErrorMessage(null)
    setAnalyzing(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function updateAcceptanceCriterion(index: number, value: string) {
    setAnalysis((current) => {
      if (!current) {
        return current
      }

      const acceptanceCriteria = [...current.acceptanceCriteria]
      acceptanceCriteria[index] = value
      return { ...current, acceptanceCriteria }
    })
  }

  function updateGap(index: number, value: string) {
    setAnalysis((current) => {
      if (!current) {
        return current
      }

      const gaps = [...current.gaps]
      gaps[index] = value
      return { ...current, gaps }
    })
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Refinement
      </h1>
      <p className="mt-2 text-gray-600">
        Upload a PDF and refine requirements using the mock AI provider.
      </p>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Upload PDF</h2>
        <p className="mt-1 text-sm text-gray-600">
          Select a requirement document and run mock refinement analysis.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-gray-700">
            PDF file
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              disabled={analyzing}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-800 hover:file:bg-gray-200"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null)
                setErrorMessage(null)
              }}
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleAnalyze()}
              disabled={analyzing || !selectedFile}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={analyzing}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {analyzing && (
        <p className="mt-4 text-sm text-gray-600">Analyzing PDF requirements...</p>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {analysis && (
        <section className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Analysis Results
            </h2>
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              Provider: {analysis.provider}
            </span>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">
              Source Text
            </label>
            <textarea
              readOnly
              value={analysis.sourceText}
              rows={6}
              className={`${textareaClass} bg-gray-50`}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">
              Refined Story
            </label>
            <textarea
              value={analysis.refinedStory}
              onChange={(event) =>
                setAnalysis((current) =>
                  current
                    ? { ...current, refinedStory: event.target.value }
                    : current,
                )
              }
              rows={5}
              className={textareaClass}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Acceptance Criteria
            </h3>
            <div className="mt-2 space-y-3">
              {analysis.acceptanceCriteria.map((criterion, index) => (
                <div key={`criterion-${index}`}>
                  <label className="text-xs font-medium text-gray-600">
                    Criterion {index + 1}
                  </label>
                  <textarea
                    value={criterion}
                    onChange={(event) =>
                      updateAcceptanceCriterion(index, event.target.value)
                    }
                    rows={3}
                    className={textareaClass}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">Gaps</h3>
            <div className="mt-2 space-y-3">
              {analysis.gaps.map((gap, index) => (
                <div key={`gap-${index}`}>
                  <label className="text-xs font-medium text-gray-600">
                    Gap {index + 1}
                  </label>
                  <textarea
                    value={gap}
                    onChange={(event) => updateGap(index, event.target.value)}
                    rows={2}
                    className={textareaClass}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
