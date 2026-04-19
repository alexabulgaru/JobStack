import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/navbar'
import { API_BASE_URL } from '../common/api'
import { getSecureToken } from '../common/secureStorage'
import type { JobApplicationDto, JobApplicationStatusDto, JobApplicationTagDto, PageResponse } from '../common/types'

function JobsEditPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const jobId = Number(id)

    const [application, setApplication] = useState<JobApplicationDto | null>(null)
    const [statuses, setStatuses] = useState<JobApplicationStatusDto[]>([])
    const [tags, setTags] = useState<JobApplicationTagDto[]>([])
    const [companyName, setCompanyName] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [appliedDate, setAppliedDate] = useState('')
    const [statusId, setStatusId] = useState<string>('')
    const [description, setDescription] = useState('')
    const [hrContactEmail, setHrContactEmail] = useState('')
    const [tagIds, setTagIds] = useState<number[]>([])
    const [timeline, setTimeline] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const authHeaders = useMemo(() => {
        const token = getSecureToken()
        return token ? { Authorization: `Bearer ${token}` } : null
    }, [])

    const loadStatusesAndTags = useCallback(async () => {
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

    const loadApplication = useCallback(async () => {
        if (!authHeaders || !Number.isFinite(jobId)) {
            setErrorMessage('Invalid job ID.')
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            const { data } = await axios.get<PageResponse<JobApplicationDto>>(`${API_BASE_URL}/api/applications/get-my-list`, {
                headers: authHeaders,
                params: { page: 0, size: 1000 },
            })

            const found = data.content.find((item) => item.id === jobId)
            if (!found) {
                setErrorMessage('Job not found or you do not have access to it.')
                setLoading(false)
                return
            }

            setApplication(found)
            setCompanyName(found.companyName ?? '')
            setJobTitle(found.jobTitle ?? '')
            setAppliedDate(found.appliedDate ?? '')
            setDescription(found.description ?? '')
            setHrContactEmail(found.hrContactEmail ?? '')
            setTimeline(found.timeline ?? '')
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to load job.')
            } else {
                setErrorMessage('Failed to load job.')
            }
        } finally {
            setLoading(false)
        }
    }, [authHeaders, jobId])

    useEffect(() => {
        void loadStatusesAndTags()
    }, [loadStatusesAndTags])

    useEffect(() => {
        void loadApplication()
    }, [loadApplication])

    useEffect(() => {
        if (!application || statuses.length === 0) {
            return
        }

        const currentStatus = statuses.find((status) => status.name === application.status)
        if (currentStatus) {
            setStatusId(String(currentStatus.id))
        }
    }, [application, statuses])

    useEffect(() => {
        if (!application || tags.length === 0) {
            return
        }

        const currentTagIds = tags
            .filter((tag) => (application.tags ?? []).includes(tag.name))
            .map((tag) => tag.id)
        setTagIds(currentTagIds)
    }, [application, tags])

    const toggleTag = (idToToggle: number) => {
        setTagIds((prev) =>
            prev.includes(idToToggle)
                ? prev.filter((id) => id !== idToToggle)
                : [...prev, idToToggle],
        )
    }

    const handleSave = async () => {
        if (!authHeaders || !application) {
            setErrorMessage('You are not authenticated.')
            return
        }

        if (!companyName.trim() || !jobTitle.trim() || !statusId) {
            setErrorMessage('Company, job title, and status are required.')
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            await axios.patch(
                `${API_BASE_URL}/api/applications/patch/${application.id}`,
                {
                    companyName: companyName.trim(),
                    jobTitle: jobTitle.trim(),
                    appliedDate: appliedDate || null,
                    statusId: Number(statusId),
                    description: description.trim() || null,
                    hrContactEmail: hrContactEmail.trim() || null,
                    timeline: timeline.trim() || null,
                    tagIds,
                },
                { headers: authHeaders },
            )
            navigate('/jobs')
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to update job.')
            } else {
                setErrorMessage('Failed to update job.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#fd79a8]'>
            <Navbar />
            <main className='mx-auto w-full max-w-4xl px-4 pb-10 pt-6'>
                <h1 className='mb-6 text-center text-3xl font-extrabold tracking-tight text-white md:text-5xl'>Edit Job</h1>

                {errorMessage ? <p className='mb-3 text-center text-sm font-semibold text-red-100'>{errorMessage}</p> : null}

                <div className='space-y-4 rounded-2xl border border-white/30 bg-white/95 p-6 shadow-xl'>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <label className='text-sm font-semibold text-slate-700'>
                            Company Name
                            <input
                                type='text'
                                value={companyName}
                                onChange={(event) => setCompanyName(event.target.value)}
                                className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                            />
                        </label>

                        <label className='text-sm font-semibold text-slate-700'>
                            Job Title
                            <input
                                type='text'
                                value={jobTitle}
                                onChange={(event) => setJobTitle(event.target.value)}
                                className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                            />
                        </label>

                        <label className='text-sm font-semibold text-slate-700'>
                            Applied Date
                            <input
                                type='date'
                                value={appliedDate}
                                onChange={(event) => setAppliedDate(event.target.value)}
                                className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                            />
                        </label>

                        <label className='text-sm font-semibold text-slate-700'>
                            Status
                            <select
                                value={statusId}
                                onChange={(event) => setStatusId(event.target.value)}
                                className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                            >
                                <option value=''>Select status</option>
                                {statuses.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className='block text-sm font-semibold text-slate-700'>
                        Notes
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        />
                    </label>

                    <label className='block text-sm font-semibold text-slate-700'>
                        Link / HR Contact
                        <input
                            type='text'
                            value={hrContactEmail}
                            onChange={(event) => setHrContactEmail(event.target.value)}
                            placeholder='https://... or hr@company.com'
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        />
                    </label>

                    <div>
                        <p className='text-sm font-semibold text-slate-700'>Tags</p>
                        <div className='mt-2 flex flex-wrap gap-2'>
                            {tags.map((tag) => {
                                const active = tagIds.includes(tag.id)
                                return (
                                    <button
                                        key={tag.id}
                                        type='button'
                                        onClick={() => toggleTag(tag.id)}
                                        className={`rounded-md border px-3 py-1 text-xs font-semibold transition ${active
                                            ? 'border-[#a29bfe] bg-[#a29bfe] text-white'
                                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        {tag.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <label className='block text-sm font-semibold text-slate-700'>
                        Timeline
                        <textarea
                            value={timeline}
                            onChange={(event) => setTimeline(event.target.value)}
                            rows={5}
                            placeholder='04 March - Applied\n24 March - Contacted by HR\n26 March - First interview'
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        />
                    </label>

                    <div className='flex flex-wrap items-center justify-end gap-2'>
                        <button
                            type='button'
                            onClick={() => navigate('/jobs')}
                            className='rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
                        >
                            Back
                        </button>
                        <button
                            type='button'
                            onClick={() => void handleSave()}
                            disabled={loading}
                            className='rounded-md bg-[#a29bfe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8f86f8] disabled:opacity-60'
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default JobsEditPage
