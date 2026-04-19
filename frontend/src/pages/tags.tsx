import Navbar from '../components/navbar'
import DataTable from '../components/data-table'
import PaginationControls, { resolvePaginationState } from '../components/pagination-controls'
import FormModal from '../components/form-modal'
import ConfirmModal from '../components/confirm-modal'
import SuccessModal from '../components/success-modal'
import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../common/api'
import { getSecureToken } from '../common/secureStorage'
import type { PageResponse, TagRow } from '../common/types'

const TAGS_PAGE_SIZE = 10

function TagsPage() {
    const [rows, setRows] = useState<TagRow[]>([])
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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingTag, setEditingTag] = useState<TagRow | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingTag, setDeletingTag] = useState<TagRow | null>(null)
    const [isDeletingTag, setIsDeletingTag] = useState(false)

    const authHeaders = useMemo(() => {
        const token = getSecureToken()
        return token ? { Authorization: `Bearer ${token}` } : null
    }, [])

    const loadTags = useCallback(async () => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            const { data } = await axios.get<PageResponse<TagRow>>(`${API_BASE_URL}/api/tags/get-all`, {
                headers: authHeaders,
                params: { page, size: TAGS_PAGE_SIZE },
            })

            const mappedRows = data.content.map<TagRow>((tag) => ({
                id: tag.id,
                name: tag.name,
            }))

            setRows(mappedRows)

            const resolvedPagination = resolvePaginationState(data, page, TAGS_PAGE_SIZE, mappedRows.length)
            setCurrentPage(resolvedPagination.resolvedPageNumber)
            setTotalPages(resolvedPagination.resolvedTotalPages)
            if (resolvedPagination.resolvedPageNumber !== page) {
                setPage(resolvedPagination.resolvedPageNumber)
            }

            setIsFirstPage(resolvedPagination.isFirstPage)
            setIsLastPage(resolvedPagination.isLastPage)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to load tags.')
            } else {
                setErrorMessage('Failed to load tags.')
            }
        } finally {
            setLoading(false)
        }
    }, [authHeaders, page])

    useEffect(() => {
        void loadTags()
    }, [loadTags])

    const handleCreateTag = async (name: string) => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return false
        }

        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.post(
                `${API_BASE_URL}/api/tags/create`,
                { name: name.trim() },
                { headers: authHeaders },
            )

            setStatusMessage('Tag created successfully.')
            setShowSuccessPopup(true)
            await loadTags()
            return true
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to create tag.')
            } else {
                setErrorMessage('Failed to create tag.')
            }
            return false
        }
    }

    const handleEditTag = async (id: number, name: string) => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return false
        }

        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.put(
                `${API_BASE_URL}/api/tags/update/${id}`,
                { name: name.trim() },
                { headers: authHeaders },
            )

            setStatusMessage('Tag updated successfully.')
            setShowSuccessPopup(true)
            await loadTags()
            return true
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to update tag.')
            } else {
                setErrorMessage('Failed to update tag.')
            }
            return false
        }
    }

    const handleDeleteTag = async () => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        if (!deletingTag) {
            return
        }

        setIsDeletingTag(true)
        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.delete(`${API_BASE_URL}/api/tags/delete/${deletingTag.id}`, {
                headers: authHeaders,
            })

            setStatusMessage('Tag deleted successfully.')
            setShowSuccessPopup(true)
            setIsDeleteModalOpen(false)
            setDeletingTag(null)
            await loadTags()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to delete tag.')
            } else {
                setErrorMessage('Failed to delete tag.')
            }
        } finally {
            setIsDeletingTag(false)
        }
    }

    const columns = [
        { key: 'id', header: 'ID', render: (row: TagRow) => row.id },
        { key: 'name', header: 'Tag Name', render: (row: TagRow) => row.name },
        {
            key: 'action',
            header: 'Action',
            render: (row: TagRow) => (
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={() => {
                            setEditingTag(row)
                            setIsEditModalOpen(true)
                        }}
                        className='rounded-md bg-[#a29bfe] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#8f86f8]'
                    >
                        Edit
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            setDeletingTag(row)
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
            [String(row.id), row.name].join(' ').toLowerCase().includes(normalizedQuery),
        )
    }, [rows, searchQuery])

    return (
        <div className='min-h-screen bg-[#fd79a8]'>
            <Navbar />
            <main className='mx-auto w-full max-w-6xl px-4 pb-10 pt-6'>
                <h1 className='mb-6 text-center text-3xl font-extrabold tracking-tight text-white md:text-5xl'>Tags</h1>
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
                    <div className='w-full md:max-w-md'>
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
                        Create Tag
                    </button>
                </div>

                <DataTable
                    columns={columns}
                    rows={filteredRows}
                    rowKey={(row) => row.id}
                    emptyMessage={searchQuery.trim() ? 'No matching tags found.' : 'No tags yet.'}
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
                    title='Create New Tag'
                    description='Add a tag name used to classify applications.'
                    submitLabel='Create Tag'
                    initialValues={{ name: '' }}
                    fields={[
                        {
                            name: 'name',
                            label: 'Tag Name',
                            placeholder: 'Ex: frontend',
                        },
                    ]}
                    validate={(values) => {
                        const errors: Partial<Record<string, string>> = {}
                        const name = values.name?.trim() ?? ''

                        if (!name) {
                            errors.name = 'Tag name is required.'
                        } else if (name.length < 2) {
                            errors.name = 'Tag name must be at least 2 characters.'
                        }

                        return errors
                    }}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={async (values) => {
                        const created = await handleCreateTag(values.name)
                        if (created) {
                            setIsCreateModalOpen(false)
                        }
                    }}
                />

                <FormModal
                    isOpen={isEditModalOpen && editingTag !== null}
                    title='Edit Tag'
                    description='Update tag name.'
                    submitLabel='Save Changes'
                    initialValues={{ name: editingTag?.name ?? '' }}
                    fields={[
                        {
                            name: 'name',
                            label: 'Tag Name',
                            placeholder: 'Ex: frontend',
                        },
                    ]}
                    validate={(values) => {
                        const errors: Partial<Record<string, string>> = {}
                        const name = values.name?.trim() ?? ''

                        if (!name) {
                            errors.name = 'Tag name is required.'
                        } else if (name.length < 2) {
                            errors.name = 'Tag name must be at least 2 characters.'
                        }

                        return errors
                    }}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setEditingTag(null)
                    }}
                    onSubmit={async (values) => {
                        if (!editingTag) {
                            return
                        }

                        const updated = await handleEditTag(editingTag.id, values.name)
                        if (updated) {
                            setIsEditModalOpen(false)
                            setEditingTag(null)
                        }
                    }}
                />

                <ConfirmModal
                    isOpen={isDeleteModalOpen && deletingTag !== null}
                    title='Delete Tag'
                    message={`Are you sure you want to delete ${deletingTag?.name ?? 'this tag'}?`}
                    confirmLabel='Delete Tag'
                    isLoading={isDeletingTag}
                    onCancel={() => {
                        setIsDeleteModalOpen(false)
                        setDeletingTag(null)
                    }}
                    onConfirm={handleDeleteTag}
                />
            </main>
        </div>
    )
}

export default TagsPage
