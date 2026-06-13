import { useCallback, useEffect, useState } from 'react'
import {
  fetchUserStories,
  importUserStoriesCsv,
  type ImportUserStoriesResponse,
  type UserStory,
} from '../api/userStoriesApi'

function formatDate(value: string): string {
  return new Date(value).toLocaleString()
}

export default function UserStoriesPage() {
  const [stories, setStories] = useState<UserStory[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [importSummary, setImportSummary] =
    useState<ImportUserStoriesResponse | null>(null)

  const loadStories = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetchUserStories()
      setStories(response.data)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load user stories. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStories()
  }, [loadStories])

  async function handleImport() {
    if (!selectedFile) {
      setErrorMessage('Please select a CSV file before importing.')
      return
    }

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Only .csv files are allowed.')
      return
    }

    setImporting(true)
    setErrorMessage(null)
    setImportSummary(null)

    try {
      const summary = await importUserStoriesCsv(selectedFile)
      setImportSummary(summary)
      setSelectedFile(null)
      await loadStories()
    } catch (error) {
      setImportSummary(null)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Import failed. Please try again.',
      )
    } finally {
      setImporting(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        User Stories
      </h1>
      <p className="mt-2 text-gray-600">
        Import user stories from CSV and review them for sprint planning.
      </p>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Import CSV</h2>
        <p className="mt-1 text-sm text-gray-600">
          Upload a CSV with columns: external_id, title, description,
          story_points, status, sprint.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Optional CSV columns: team_name, project_name.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-gray-700">
            CSV file
            <input
              type="file"
              accept=".csv"
              disabled={importing}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-800 hover:file:bg-gray-200"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null)
                setErrorMessage(null)
                setImportSummary(null)
              }}
            />
          </label>

          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={importing || !selectedFile}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {importSummary && (
        <div
          role="status"
          className={`mt-4 rounded-md border px-4 py-3 text-sm ${
            importSummary.failed > 0
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-green-200 bg-green-50 text-green-900'
          }`}
        >
          <p>
            Import completed: {importSummary.imported} imported,{' '}
            {importSummary.failed} failed.
          </p>
          {importSummary.errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {importSummary.errors.map((item) => (
                <li key={`${item.row}-${item.message}`}>
                  Row {item.row}: {item.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className="mt-6">
        {loading ? (
          <p className="text-sm text-gray-600">Loading user stories...</p>
        ) : stories.length === 0 && !errorMessage ? (
          <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            No user stories yet. Import a CSV to get started.
          </p>
        ) : stories.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    External ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Story Points
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Sprint
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Gerencia
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Proyecto
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stories.map((story) => (
                  <tr key={story.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {story.externalId}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{story.title}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {story.storyPoints}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{story.status}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {story.sprint ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {story.teamName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {story.projectName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(story.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  )
}
