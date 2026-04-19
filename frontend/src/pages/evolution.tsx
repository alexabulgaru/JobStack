import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/navbar'
import { API_BASE_URL } from '../common/api'
import { getSecureToken } from '../common/secureStorage'
import type { EvolutionStatsMap } from '../common/types'
import MonthlyBarChart from './evolution/components/monthly-bar-chart'
import StatusPieChart from './evolution/components/status-pie-chart'
import { mapMonthlyStatsToChartData, mapStatusStatsToChartData } from './evolution/utils'

function EvolutionPage() {
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [monthlyStats, setMonthlyStats] = useState<EvolutionStatsMap>({})
    const [statusStats, setStatusStats] = useState<EvolutionStatsMap>({})

    useEffect(() => {
        const loadStats = async () => {
            const token = getSecureToken()
            if (!token) {
                setErrorMessage('You are not authenticated.')
                return
            }

            setLoading(true)
            setErrorMessage(null)

            try {
                const headers = { Authorization: `Bearer ${token}` }
                const [monthlyResult, statusResult] = await Promise.all([
                    axios.get<EvolutionStatsMap>(`${API_BASE_URL}/api/applications/stats/monthly`, { headers }),
                    axios.get<EvolutionStatsMap>(`${API_BASE_URL}/api/applications/stats/status`, { headers }),
                ])

                setMonthlyStats(monthlyResult.data ?? {})
                setStatusStats(statusResult.data ?? {})
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setErrorMessage(typeof error.response?.data === 'string' ? error.response.data : 'Failed to load evolution stats.')
                } else {
                    setErrorMessage('Failed to load evolution stats.')
                }
            } finally {
                setLoading(false)
            }
        }

        void loadStats()
    }, [])

    const monthlyChartData = useMemo(() => {
        return mapMonthlyStatsToChartData(monthlyStats)
    }, [monthlyStats])

    const statusChartData = useMemo(() => {
        return mapStatusStatsToChartData(statusStats)
    }, [statusStats])

    return (
        <div className='min-h-screen bg-[#fd79a8]'>
            <Navbar />
            <main className='mx-auto w-full max-w-5xl px-4 pb-10 pt-6'>
                <h1 className='mb-6 text-center text-3xl font-extrabold tracking-tight text-white md:text-5xl'>Applications Evolution</h1>

                {errorMessage ? <p className='mb-4 text-center text-sm font-semibold text-red-100'>{errorMessage}</p> : null}
                {loading ? <p className='mb-4 text-center text-sm font-semibold text-white'>Loading stats...</p> : null}

                <div className='grid gap-5 md:grid-cols-2'>
                    <MonthlyBarChart
                        title='Monthly Evolution'
                        data={monthlyChartData}
                        emptyMessage='No monthly stats yet. Add job applications to generate this chart.'
                    />
                    <StatusPieChart
                        title='Applications by Status'
                        data={statusChartData}
                        emptyMessage='No status stats yet. Add job applications to generate this chart.'
                    />
                </div>
            </main>
        </div>
    )
}

export default EvolutionPage
