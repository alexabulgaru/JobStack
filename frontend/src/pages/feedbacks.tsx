import Navbar from '../components/navbar'
import DataTable from '../components/data-table'
import PaginationControls, { resolvePaginationState } from '../components/pagination-controls'
import FormModal from '../components/form-modal'
import ConfirmModal from '../components/confirm-modal'
import SuccessModal from '../components/success-modal'
import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../common/api'
import { FEEDBACK_CATEGORIES } from '../common/feedback-categories'
import { getSecureToken } from '../common/secureStorage'
import type { AdminUserDto, FeedbackRow, PageResponse } from '../common/types'

const FEEDBACKS_PAGE_SIZE = 10

function FeedbacksPage() {
    const [rows, setRows] = useState<FeedbackRow[]>([])
    const [page, setPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [isFirstPage, setIsFirstPage] = useState(true)
    const [isLastPage, setIsLastPage] = useState(true)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [userNameByEmail, setUserNameByEmail] = useState<Record<string, string>>({})
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingFeedback, setEditingFeedback] = useState<FeedbackRow | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingFeedback, setDeletingFeedback] = useState<FeedbackRow | null>(null)
    const [isDeletingFeedback, setIsDeletingFeedback] = useState(false)

    const authHeaders = useMemo(() => {
        const token = getSecureToken()
        return token ? { Authorization: `Bearer ${token}` } : null
    }, [])

    const loadUserNames = useCallback(async () => {
        if (!authHeaders) {
            return
        }

        try {
            const { data } = await axios.get<PageResponse<AdminUserDto>>(`${API_BASE_URL}/api/users/get-all`, {
                headers: authHeaders,
                params: { page: 0, size: 1000 },
            })

            const nextMap: Record<string, string> = {}
            for (const user of data.content) {
                const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                nextMap[user.email] = fullName || user.email
            }

            setUserNameByEmail(nextMap)
        } catch {
            setUserNameByEmail({})
        }
    }, [authHeaders])

    const loadFeedbacks = useCallback(async () => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            const { data } = await axios.get<PageResponse<FeedbackRow>>(`${API_BASE_URL}/api/feedbacks/get-all`, {
                headers: authHeaders,
                params: { page, size: FEEDBACKS_PAGE_SIZE },
            })

            const mappedRows = data.content.map<FeedbackRow>((feedback) => ({
                id: feedback.id,
                category: feedback.category,
                rating: feedback.rating,
                contactConsent: feedback.contactConsent,
                comments: feedback.comments,
                userEmail: feedback.userEmail,
                createdAt: feedback.createdAt,
            }))

            setRows(mappedRows)

            const resolvedPagination = resolvePaginationState(data, page, FEEDBACKS_PAGE_SIZE, mappedRows.length)
            setCurrentPage(resolvedPagination.resolvedPageNumber)
            setTotalPages(resolvedPagination.resolvedTotalPages)
            if (resolvedPagination.resolvedPageNumber !== page) {
                setPage(resolvedPagination.resolvedPageNumber)
            }

            setIsFirstPage(resolvedPagination.isFirstPage)
            setIsLastPage(resolvedPagination.isLastPage)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to load feedbacks.')
            } else {
                setErrorMessage('Failed to load feedbacks.')
            }
        } finally {
            setLoading(false)
        }
    }, [authHeaders, page])

    useEffect(() => {
        void loadFeedbacks()
    }, [loadFeedbacks])

    useEffect(() => {
        void loadUserNames()
    }, [loadUserNames])

    const parseRating = useCallback((value: string) => {
        const parsed = Number(value)
        if (!Number.isFinite(parsed)) {
            return null
        }
        return parsed
    }, [])

    const parseContactConsent = useCallback((value: string) => {
        const normalized = value.trim().toLowerCase()
        if (['yes', 'y', 'true', '1'].includes(normalized)) {
            return true
        }
        if (['no', 'n', 'false', '0'].includes(normalized)) {
            return false
        }
        return null
    }, [])

    const handleCreateFeedback = async (values: Record<string, string>) => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return false
        }

        const parsedRating = parseRating(values.rating ?? '')
        const parsedContactConsent = parseContactConsent(values.contactConsent ?? '')
        if (parsedRating === null || parsedContactConsent === null) {
            setErrorMessage('Please provide valid rating and contact consent values.')
            return false
        }

        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.post(
                `${API_BASE_URL}/api/feedbacks/create`,
                {
                    category: values.category,
                    rating: parsedRating,
                    contactConsent: parsedContactConsent,
                    comments: values.comments,
                    userEmail: values.userEmail,
                },
                { headers: authHeaders },
            )

            setStatusMessage('Feedback created successfully.')
            setShowSuccessPopup(true)
            await loadFeedbacks()
            return true
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to create feedback.')
            } else {
                setErrorMessage('Failed to create feedback.')
            }
            return false
        }
    }

    const handleEditFeedback = async (values: Record<string, string>) => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return false
        }

        if (!editingFeedback) {
            return false
        }

        const parsedRating = parseRating(values.rating ?? '')
        const parsedContactConsent = parseContactConsent(values.contactConsent ?? '')
        if (parsedRating === null || parsedContactConsent === null) {
            setErrorMessage('Please provide valid rating and contact consent values.')
            return false
        }

        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.put(
                `${API_BASE_URL}/api/feedbacks/update/${editingFeedback.id}`,
                {
                    category: values.category,
                    rating: parsedRating,
                    contactConsent: parsedContactConsent,
                    comments: values.comments,
                    userEmail: values.userEmail,
                },
                { headers: authHeaders },
            )

            setStatusMessage('Feedback updated successfully.')
            setShowSuccessPopup(true)
            await loadFeedbacks()
            return true
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to update feedback.')
            } else {
                setErrorMessage('Failed to update feedback.')
            }
            return false
        }
    }

    const handleDeleteFeedback = async () => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        if (!deletingFeedback) {
            return
        }

        setIsDeletingFeedback(true)
        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.delete(`${API_BASE_URL}/api/feedbacks/delete/${deletingFeedback.id}`, {
                headers: authHeaders,
            })

            setStatusMessage('Feedback deleted successfully.')
            setShowSuccessPopup(true)
            setIsDeleteModalOpen(false)
            setDeletingFeedback(null)
            await loadFeedbacks()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to delete feedback.')
            } else {
                setErrorMessage('Failed to delete feedback.')
            }
        } finally {
            setIsDeletingFeedback(false)
        }
    }

    const getDisplayUserName = useCallback((email: string) => {
        return userNameByEmail[email] ?? email
    }, [userNameByEmail])

    const columns = [
        { key: 'id', header: 'ID', render: (row: FeedbackRow) => row.id },
        { key: 'category', header: 'Category', render: (row: FeedbackRow) => row.category },
        { key: 'rating', header: 'Rating', render: (row: FeedbackRow) => row.rating },
        {
            key: 'contactConsent',
            header: 'Contact Consent',
            render: (row: FeedbackRow) => (row.contactConsent ? 'Yes' : 'No'),
        },
        { key: 'comments', header: 'Comments', render: (row: FeedbackRow) => row.comments },
        { key: 'userEmail', header: 'User', render: (row: FeedbackRow) => getDisplayUserName(row.userEmail) },
        {
            key: 'action',
            header: 'Action',
            render: (row: FeedbackRow) => (
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={() => {
                            setEditingFeedback(row)
                            setIsEditModalOpen(true)
                        }}
                        className='rounded-md bg-[#a29bfe] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#8f86f8]'
                    >
                        Edit
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            setDeletingFeedback(row)
                            setIsDeleteModalOpen(true)
                        }}
                        className='rounded-md bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600'
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ]

    const filteredRows = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()
        if (!normalizedQuery) {
            return rows
        }

        return rows.filter((row) =>
            [
                String(row.id),
                row.category,
                String(row.rating),
                row.contactConsent ? 'yes true' : 'no false',
                row.comments,
                row.userEmail,
                getDisplayUserName(row.userEmail),
            ]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery),
        )
    }, [getDisplayUserName, rows, searchQuery])

    return (
        <div className='min-h-screen bg-[#fd79a8]'>
            <Navbar />
            <main className='mx-auto w-full max-w-6xl px-4 pb-10 pt-6'>
                <h1 className='mb-6 text-center text-3xl font-extrabold tracking-tight text-white md:text-5xl'>Feedbacks</h1>

                {errorMessage ? <p className='mb-3 text-center text-sm font-semibold text-red-100'>{errorMessage}</p> : null}

                <SuccessModal
                    isOpen={showSuccessPopup && statusMessage !== null}
                    message={statusMessage ?? ''}
                    onClose={() => {
                        setShowSuccessPopup(false)
                        setStatusMessage(null)
                    }}
                />

                <div className='mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-center'>
                    <div className='w-full max-w-md'>
                        <input
                            type='text'
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder='Search'
                            className='w-full rounded-md border border-white/50 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        />
                    </div>

                    <button
                        type='button'
                        onClick={() => setIsCreateModalOpen(true)}
                        className='w-full rounded-md bg-[#a29bfe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8f86f8] md:w-auto md:shrink-0'
                    >
                        Create Feedback
                    </button>
                </div>

                <DataTable
                    columns={columns}
                    rows={filteredRows}
                    rowKey={(row) => row.id}
                    emptyMessage={searchQuery.trim() ? 'No matching feedback found.' : 'No feedback entries yet.'}
                />

                <PaginationControls
                    loading={loading}
                    isFirstPage={isFirstPage}
                    isLastPage={isLastPage}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrev={() => setPage((prev) => Math.max(prev - 1, 0))}
                    onNext={() => setPage((prev) => prev + 1)}
                />

                <FormModal
                    isOpen={isCreateModalOpen}
                    title='Create Feedback'
                    description='Create feedback from the admin dashboard.'
                    submitLabel='Create Feedback'
                    initialValues={{
                        category: FEEDBACK_CATEGORIES[0],
                        rating: '5',
                        contactConsent: 'yes',
                        comments: '',
                        userEmail: '',
                    }}
                    fields={[
                        {
                            name: 'category',
                            label: 'Category',
                            type: 'select',
                            options: FEEDBACK_CATEGORIES.map((category) => ({
                                label: category,
                                value: category,
                            })),
                        },
                        { name: 'rating', label: 'Rating (1-5)', placeholder: 'Ex: 5' },
                        { name: 'contactConsent', label: 'Contact Consent (yes/no)', placeholder: 'yes or no' },
                        { name: 'comments', label: 'Comments', placeholder: 'Feedback details...' },
                        { name: 'userEmail', label: 'User Email', placeholder: 'Ex: user@company.com', type: 'email' },
                    ]}
                    validate={(values) => {
                        const errors: Partial<Record<string, string>> = {}
                        const rating = parseRating(values.rating ?? '')
                        const consent = parseContactConsent(values.contactConsent ?? '')
                        const email = values.userEmail?.trim() ?? ''

                        if (!values.category?.trim()) {
                            errors.category = 'Category is required.'
                        }

                        if (rating === null || rating < 1 || rating > 5) {
                            errors.rating = 'Rating must be a number from 1 to 5.'
                        }

                        if (consent === null) {
                            errors.contactConsent = 'Use yes/no, true/false, or 1/0.'
                        }

                        if (!values.comments?.trim()) {
                            errors.comments = 'Comments are required.'
                        }

                        if (!email) {
                            errors.userEmail = 'User email is required.'
                        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            errors.userEmail = 'Please enter a valid email.'
                        }

                        return errors
                    }}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={async (values) => {
                        const created = await handleCreateFeedback(values)
                        if (created) {
                            setIsCreateModalOpen(false)
                        }
                    }}
                />

                <FormModal
                    isOpen={isEditModalOpen && editingFeedback !== null}
                    title='Edit Feedback'
                    description='Update feedback details.'
                    submitLabel='Save Changes'
                    initialValues={{
                        category: editingFeedback?.category ?? '',
                        rating: String(editingFeedback?.rating ?? ''),
                        contactConsent: editingFeedback?.contactConsent ? 'yes' : 'no',
                        comments: editingFeedback?.comments ?? '',
                        userEmail: editingFeedback?.userEmail ?? '',
                    }}
                    fields={[
                        { name: 'category', label: 'Category', placeholder: 'Ex: UI' },
                        { name: 'rating', label: 'Rating (1-5)', placeholder: 'Ex: 5' },
                        { name: 'contactConsent', label: 'Contact Consent (yes/no)', placeholder: 'yes or no' },
                        { name: 'comments', label: 'Comments', placeholder: 'Feedback details...' },
                        { name: 'userEmail', label: 'User Email', placeholder: 'Ex: user@company.com', type: 'email' },
                    ]}
                    validate={(values) => {
                        const errors: Partial<Record<string, string>> = {}
                        const rating = parseRating(values.rating ?? '')
                        const consent = parseContactConsent(values.contactConsent ?? '')
                        const email = values.userEmail?.trim() ?? ''

                        if (!values.category?.trim()) {
                            errors.category = 'Category is required.'
                        }

                        if (rating === null || rating < 1 || rating > 5) {
                            errors.rating = 'Rating must be a number from 1 to 5.'
                        }

                        if (consent === null) {
                            errors.contactConsent = 'Use yes/no, true/false, or 1/0.'
                        }

                        if (!values.comments?.trim()) {
                            errors.comments = 'Comments are required.'
                        }

                        if (!email) {
                            errors.userEmail = 'User email is required.'
                        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            errors.userEmail = 'Please enter a valid email.'
                        }

                        return errors
                    }}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setEditingFeedback(null)
                    }}
                    onSubmit={async (values) => {
                        const updated = await handleEditFeedback(values)
                        if (updated) {
                            setIsEditModalOpen(false)
                            setEditingFeedback(null)
                        }
                    }}
                />

                <ConfirmModal
                    isOpen={isDeleteModalOpen && deletingFeedback !== null}
                    title='Delete Feedback'
                    message={`Are you sure you want to delete feedback #${deletingFeedback?.id ?? ''}?`}
                    confirmLabel='Delete Feedback'
                    isLoading={isDeletingFeedback}
                    onCancel={() => {
                        setIsDeleteModalOpen(false)
                        setDeletingFeedback(null)
                    }}
                    onConfirm={handleDeleteFeedback}
                />
            </main>
        </div>
    )
}

export default FeedbacksPage
