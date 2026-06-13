import { useCallback, useEffect, useState } from 'react'
import {
  fetchSprintAnalysis,
  formatUtilization,
  type SprintAnalysisRow,
  type SprintAnalysisStatus,
} from '../api/sprintAnalysisApi'

const statusBadgeClass: Record<SprintAnalysisStatus, string> = {
  HEALTHY: 'bg-green-100 text-green-800',
  WARNING: 'bg-amber-100 text-amber-900',
  OVERLOADED: 'bg-red-100 text-red-800',
}

function StatusBadge({ status }: { status: SprintAnalysisStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass[status]}`}
    >
      {status}
    </span>
  )
}

export default function SprintAnalysisPage() {
  const [rows, setRows] = useState<SprintAnalysisRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadAnalysis = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const data = await fetchSprintAnalysis()
      setRows(data)
    } catch (error) {
      setRows([])
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load sprint analysis. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAnalysis()
  }, [loadAnalysis])

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Sprint Analysis
      </h1>
      <p className="mt-2 text-gray-600">
        Compare sprint demand against adjusted team capacity.
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      <section className="mt-6">
        {loading ? (
          <p className="text-sm text-gray-600">Loading sprint analysis...</p>
        ) : rows.length === 0 && !errorMessage ? (
          <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            No sprint data yet. Import user stories and configure capacity in
            Settings.
          </p>
        ) : rows.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
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
                    Demand
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Capacity
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Absences
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Adjusted Capacity
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Utilization
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row) => (
                  <tr
                    key={`${row.sprint}|${row.teamName}|${row.projectName}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.sprint}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{row.teamName}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {row.projectName}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{row.demand}</td>
                    <td className="px-4 py-3 text-gray-800">{row.capacity}</td>
                    <td className="px-4 py-3 text-gray-800">{row.absences}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {row.adjustedCapacity}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {formatUtilization(row.utilization)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
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
