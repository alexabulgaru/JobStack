import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmModal from '../components/confirm-modal'
import Navbar from '../components/navbar'
import SuccessModal from '../components/success-modal'
import { API_BASE_URL } from '../common/api'
import { getSecureToken } from '../common/secureStorage'
import type { JobApplicationDto, JobApplicationStatusDto, JobApplicationTagDto, PageResponse } from '../common/types'
import type { JobDraft } from '../common/types'
import CreateJobModal from './jobs/components/create-job-modal'
import JobDetailsModal from './jobs/components/job-details-modal'
import JobsKanbanBoard from './jobs/components/jobs-kanban-board'
import { INITIAL_JOB_DRAFT } from './jobs/constants'
import { buildJobsByStatus, getOrderedColumns } from './jobs/utils'

function JobsPage() {
    const [applications, setApplications] = useState<JobApplicationDto[]>([])
    const [statuses, setStatuses] = useState<JobApplicationStatusDto[]>([])
    const [tags, setTags] = useState<JobApplicationTagDto[]>([])
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null)
    const [dropStatusName, setDropStatusName] = useState<string | null>(null)

    const [createOpen, setCreateOpen] = useState(false)
    const [draft, setDraft] = useState<JobDraft>(INITIAL_JOB_DRAFT)
    const [createLoading, setCreateLoading] = useState(false)

    const [selectedJob, setSelectedJob] = useState<JobApplicationDto | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const authHeaders = useMemo(() => {
        const token = getSecureToken()
        return token ? { Authorization: `Bearer ${token}` } : null
    }, [])

    const loadFilters = useCallback(async () => {
        if (!authHeaders) {
            return
        }

        try {
            const [statusesResult, tagsResult] = await Promise.all([
                axios.get<PageResponse<JobApplicationStatusDto>>(`${API_BASE_URL}/api/statuses/get-all`, {
                    headers: authHeaders,
                    params: { page: 0, size: 200 },
                }),
                axios.get<PageResponse<JobApplicationTagDto>>(`${API_BASE_URL}/api/tags/get-all`, {
                    headers: authHeaders,
                    params: { page: 0, size: 200 },
                }),
            ])

            setStatuses(statusesResult.data.content)
            setTags(tagsResult.data.content)
        } catch {
            setStatuses([])
            setTags([])
        }
    }, [authHeaders])

    const loadApplications = useCallback(async () => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            const { data } = await axios.get<PageResponse<JobApplicationDto>>(`${API_BASE_URL}/api/applications/get-my-list`, {
                headers: authHeaders,
                params: { page: 0, size: 1000 },
            })
            setApplications(data.content)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to load jobs.')
            } else {
                setErrorMessage('Failed to load jobs.')
            }
        } finally {
            setLoading(false)
        }
    }, [authHeaders])

    useEffect(() => {
        void loadFilters()
        void loadApplications()
    }, [loadApplications, loadFilters])

    const columns = useMemo(() => {
        return getOrderedColumns(statuses, applications)
    }, [applications, statuses])

    const jobsByStatus = useMemo(() => {
        return buildJobsByStatus(columns, applications)
    }, [applications, columns])

    const resetDraft = () => {
        setDraft(INITIAL_JOB_DRAFT)
    }

    const toggleDraftTag = (tagId: number) => {
        setDraft((prev) => ({
            ...prev,
            tagIds: prev.tagIds.includes(tagId)
                ? prev.tagIds.filter((id) => id !== tagId)
                : [...prev.tagIds, tagId],
        }))
    }

    const handleCreate = async () => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        if (!draft.companyName.trim() || !draft.jobTitle.trim() || !draft.statusId) {
            setErrorMessage('Company, job title and status are required.')
            return
        }

        setCreateLoading(true)
        setErrorMessage(null)

        try {
            await axios.post(
                `${API_BASE_URL}/api/applications/create`,
                {
                    companyName: draft.companyName.trim(),
                    jobTitle: draft.jobTitle.trim(),
                    statusId: Number(draft.statusId),
                    appliedDate: draft.appliedDate || null,
                    description: draft.description.trim() || null,
                    hrContactEmail: draft.hrContactEmail.trim() || null,
                    tagIds: draft.tagIds,
                },
                { headers: authHeaders },
            )

            setCreateOpen(false)
            resetDraft()
            setSuccessMessage('Job added successfully.')
            await loadApplications()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to add job.')
            } else {
                setErrorMessage('Failed to add job.')
            }
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!authHeaders || !selectedJob) {
            return
        }

        setDeleteLoading(true)
        setErrorMessage(null)

        try {
            await axios.delete(`${API_BASE_URL}/api/applications/delete/${selectedJob.id}`, {
                headers: authHeaders,
            })
            setDeleteOpen(false)
            setSelectedJob(null)
            setSuccessMessage('Job deleted successfully.')
            await loadApplications()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to delete job.')
            } else {
                setErrorMessage('Failed to delete job.')
            }
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleDragStart = (jobId: number) => {
        setDraggedJobId(jobId)
    }

    const handleDragEnd = () => {
        setDraggedJobId(null)
        setDropStatusName(null)
    }

    const handleDropOnStatus = async (statusName: string) => {
        if (!authHeaders || draggedJobId === null) {
            return
        }

        const targetStatus = statuses.find((status) => status.name === statusName)
        if (!targetStatus) {
            setDraggedJobId(null)
            setDropStatusName(null)
            return
        }

        const draggedJob = applications.find((job) => job.id === draggedJobId)
        if (!draggedJob || draggedJob.status === statusName) {
            setDraggedJobId(null)
            setDropStatusName(null)
            return
        }

        setApplications((prev) =>
            prev.map((job) =>
                job.id === draggedJobId
                    ? {
                        ...job,
                        status: statusName,
                    }
                    : job,
            ),
        )

        try {
            await axios.patch(
                `${API_BASE_URL}/api/applications/patch/${draggedJobId}`,
                {
                    statusId: targetStatus.id,
                },
                { headers: authHeaders },
            )
        } catch {
            setErrorMessage('Failed to move job. Please try again.')
            await loadApplications()
        } finally {
            setDraggedJobId(null)
            setDropStatusName(null)
        }
    }

    return (
        <div className='min-h-screen bg-[#fd79a8]'>
            <Navbar />
            <main className='mx-auto w-full max-w-[1400px] px-4 pb-8 pt-6'>
                <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
                    <h1 className='text-3xl font-extrabold tracking-tight text-white md:text-5xl'>My Jobs</h1>
                    <button
                        type='button'
                        onClick={() => setCreateOpen(true)}
                        className='rounded-md border border-white/30 bg-[#a29bfe] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#8f86f8]'
                    >
                        Add Job
                    </button>
                </div>

                {errorMessage ? <p className='mb-3 text-sm font-semibold text-red-100'>{errorMessage}</p> : null}

                {loading ? <p className='text-sm font-semibold text-white'>Loading jobs...</p> : null}

                {!loading && columns.length === 0 ? (
                    <div className='rounded-xl border border-white/30 bg-white/90 p-6 text-sm font-semibold text-slate-700'>
                        No jobs yet. Add one to start tracking your applications.
                    </div>
                ) : null}

                {!loading && columns.length > 0 ? (
                    <JobsKanbanBoard
                        jobsByStatus={jobsByStatus}
                        draggedJobId={draggedJobId}
                        dropStatusName={dropStatusName}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDropStatus={(statusName) => {
                            void handleDropOnStatus(statusName)
                        }}
                        onDropStatusHover={setDropStatusName}
                        onSelectJob={setSelectedJob}
                    />
                ) : null}
            </main>

            <CreateJobModal
                isOpen={createOpen}
                draft={draft}
                statuses={statuses}
                tags={tags}
                createLoading={createLoading}
                onClose={() => {
                    setCreateOpen(false)
                    resetDraft()
                }}
                onSave={() => {
                    void handleCreate()
                }}
                onDraftChange={setDraft}
                onToggleTag={toggleDraftTag}
            />

            <JobDetailsModal
                selectedJob={selectedJob}
                onDelete={() => setDeleteOpen(true)}
                onClose={() => setSelectedJob(null)}
            />

            <ConfirmModal
                isOpen={deleteOpen}
                title='Delete Job'
                message='Are you sure you want to delete this job application? This action cannot be undone.'
                confirmLabel='Delete'
                isLoading={deleteLoading}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
            />

            <SuccessModal
                isOpen={successMessage !== null}
                message={successMessage ?? ''}
                onClose={() => setSuccessMessage(null)}
            />
        </div>
    )
}

export default JobsPage
