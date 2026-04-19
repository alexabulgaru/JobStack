import type { EvolutionChartItem, EvolutionStatsMap } from '../../common/types'

const PREFERRED_STATUS_ORDER = ['pending', 'accepted', 'rejected']

export function mapMonthlyStatsToChartData(stats: EvolutionStatsMap): EvolutionChartItem[] {
    return Object.entries(stats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ label, value }))
}

export function mapStatusStatsToChartData(stats: EvolutionStatsMap): EvolutionChartItem[] {
    return Object.entries(stats)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => {
            const aIndex = PREFERRED_STATUS_ORDER.indexOf(a.label.toLowerCase())
            const bIndex = PREFERRED_STATUS_ORDER.indexOf(b.label.toLowerCase())
            const safeAIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
            const safeBIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex

            if (safeAIndex !== safeBIndex) {
                return safeAIndex - safeBIndex
            }

            return a.label.localeCompare(b.label)
        })
}
