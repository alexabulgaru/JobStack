import type { JobApplicationDto, JobApplicationStatusDto, JobsByStatus } from '../../common/types'
import { PREFERRED_STATUS_ORDER } from './constants'

export function getOrderedColumns(
    statuses: JobApplicationStatusDto[],
    applications: JobApplicationDto[],
): string[] {
    const statusNames = statuses.map((status) => status.name)
    const missingStatusNames = Array.from(
        new Set(
            applications
                .map((job) => job.status)
                .filter((name): name is string => Boolean(name && !statusNames.includes(name))),
        ),
    )

    return [...statusNames, ...missingStatusNames].sort((a, b) => {
        const aIndex = PREFERRED_STATUS_ORDER.indexOf(a.toLowerCase())
        const bIndex = PREFERRED_STATUS_ORDER.indexOf(b.toLowerCase())
        const safeAIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
        const safeBIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex

        if (safeAIndex !== safeBIndex) {
            return safeAIndex - safeBIndex
        }

        return a.localeCompare(b)
    })
}

export function buildJobsByStatus(
    columns: string[],
    applications: JobApplicationDto[],
): JobsByStatus[] {
    return columns.map((statusName) => ({
        statusName,
        jobs: applications.filter((job) => (job.status ?? 'No status') === statusName),
    }))
}
