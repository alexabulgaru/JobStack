import Navbar from '../components/navbar'
import DataTable from '../components/data-table'
import PaginationControls, { resolvePaginationState } from '../components/pagination-controls'
import ConfirmModal from '../components/confirm-modal'
import SuccessModal from '../components/success-modal'
import FormModal from '../components/form-modal'
import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../common/api'
import { getSecureToken } from '../common/secureStorage'
import type { AdminUserDto, PageResponse, RoleDto, UserRow } from '../common/types'

const USERS_PAGE_SIZE = 10

function UsersPage() {
    const [rows, setRows] = useState<UserRow[]>([])
    const [page, setPage] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [isFirstPage, setIsFirstPage] = useState(true)
    const [isLastPage, setIsLastPage] = useState(true)
    const [loading, setLoading] = useState(false)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserRow | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletingUser, setDeletingUser] = useState<UserRow | null>(null)
    const [isDeletingUser, setIsDeletingUser] = useState(false)
    const [availableRoles, setAvailableRoles] = useState<string[]>([])
    const [selectedRoleByUserId, setSelectedRoleByUserId] = useState<Record<number, string>>({})

    const parseRoles = useCallback((rawRoles: string) => {
        return rawRoles
            .split(',')
            .map((value) => value.trim().toUpperCase())
            .filter((value) => value.length > 0)
    }, [])

    const hasUnknownRoles = useCallback((roles: string[]) => {
        if (availableRoles.length === 0) {
            return false
        }

        return roles.some((role) => !availableRoles.includes(role))
    }, [availableRoles])

    const authHeaders = useMemo(() => {
        const token = getSecureToken()
        return token ? { Authorization: `Bearer ${token}` } : null
    }, [])

    const loadUsers = useCallback(async () => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            const { data } = await axios.get<PageResponse<AdminUserDto>>(`${API_BASE_URL}/api/users/get-all`, {
                headers: authHeaders,
                params: { page, size: USERS_PAGE_SIZE },
            })

            const mappedRows = data.content.map<UserRow>((user) => ({
                id: user.id,
                firstName: user.firstName ?? '-',
                lastName: user.lastName ?? '-',
                email: user.email,
                role: user.roles?.[0] ?? '-',
            }))

            setRows(mappedRows)
            const resolvedPagination = resolvePaginationState(data, page, USERS_PAGE_SIZE, mappedRows.length)

            setCurrentPage(resolvedPagination.resolvedPageNumber)
            setTotalPages(resolvedPagination.resolvedTotalPages)
            if (resolvedPagination.resolvedPageNumber !== page) {
                setPage(resolvedPagination.resolvedPageNumber)
            }

            setIsFirstPage(resolvedPagination.isFirstPage)
            setIsLastPage(resolvedPagination.isLastPage)
            setSelectedRoleByUserId((prev) => {
                const next = { ...prev }
                for (const user of data.content) {
                    if (!next[user.id]) {
                        next[user.id] = user.roles?.[0] ?? ''
                    }
                }
                return next
            })
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to load users.')
            } else {
                setErrorMessage('Failed to load users.')
            }
        } finally {
            setLoading(false)
        }
    }, [authHeaders, page])

    const loadRoles = useCallback(async () => {
        if (!authHeaders) {
            return
        }

        try {
            const { data } = await axios.get<PageResponse<RoleDto>>(`${API_BASE_URL}/api/roles/get-all`, {
                headers: authHeaders,
                params: { page: 0, size: 100 },
            })

            setAvailableRoles(data.content.map((role) => role.name))
        } catch {
            setAvailableRoles(['USER', 'ADMIN'])
        }
    }, [authHeaders])

    useEffect(() => {
        void loadUsers()
    }, [loadUsers])

    useEffect(() => {
        void loadRoles()
    }, [loadRoles])

    const handleChangeRole = async (userId: number) => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        const roleName = selectedRoleByUserId[userId]
        if (!roleName) {
            setErrorMessage('Please select a role first.')
            return
        }

        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.patch(`${API_BASE_URL}/api/users/update-role/${userId}`, null, {
                headers: authHeaders,
                params: { roleName },
            })

            setStatusMessage('Role updated successfully.')
            setShowSuccessPopup(true)
            await loadUsers()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to update role.')
            } else {
                setErrorMessage('Failed to update role.')
            }
        }
    }

    const handleDeleteUser = async () => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return
        }

        if (!deletingUser) {
            return
        }

        setIsDeletingUser(true)
        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.delete(`${API_BASE_URL}/api/users/delete/${deletingUser.id}`, {
                headers: authHeaders,
            })

            setSelectedRoleByUserId((prev) => {
                const next = { ...prev }
                delete next[deletingUser.id]
                return next
            })

            setStatusMessage('User deleted successfully.')
            setShowSuccessPopup(true)
            setIsDeleteModalOpen(false)
            setDeletingUser(null)
            await loadUsers()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to delete user.')
            } else {
                setErrorMessage('Failed to delete user.')
            }
        } finally {
            setIsDeletingUser(false)
        }
    }

    const handleCreateUser = async (values: Record<string, string>) => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return false
        }

        const roles = parseRoles(values.roles ?? '')

        if (roles.length === 0) {
            setErrorMessage('At least one role is required.')
            return false
        }

        if (hasUnknownRoles(roles)) {
            setErrorMessage('One or more roles are invalid.')
            return false
        }

        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.post(
                `${API_BASE_URL}/api/users/create`,
                {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    password: values.password,
                    roles,
                },
                { headers: authHeaders },
            )

            setStatusMessage('User created successfully.')
            setShowSuccessPopup(true)
            await loadUsers()
            return true
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to create user.')
            } else {
                setErrorMessage('Failed to create user.')
            }
            return false
        }
    }

    const handleEditUser = async (values: Record<string, string>) => {
        if (!authHeaders) {
            setErrorMessage('You are not authenticated.')
            return false
        }

        if (!editingUser) {
            return false
        }

        const roles = parseRoles(values.roles ?? '')
        if (roles.length === 0) {
            setErrorMessage('At least one role is required.')
            return false
        }

        if (hasUnknownRoles(roles)) {
            setErrorMessage('One or more roles are invalid.')
            return false
        }

        const payload: Record<string, unknown> = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            roles,
        }

        if (values.password && values.password.trim().length > 0) {
            payload.password = values.password
        }

        setStatusMessage(null)
        setErrorMessage(null)

        try {
            await axios.put(
                `${API_BASE_URL}/api/users/update/${editingUser.id}`,
                payload,
                { headers: authHeaders },
            )

            setStatusMessage('User updated successfully.')
            setShowSuccessPopup(true)
            await loadUsers()
            return true
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data && typeof error.response.data === 'string' ? error.response.data : 'Failed to update user.')
            } else {
                setErrorMessage('Failed to update user.')
            }
            return false
        }
    }

    const columns = [
        { key: 'id', header: 'ID', render: (row: UserRow) => row.id },
        { key: 'firstName', header: 'First Name', render: (row: UserRow) => row.firstName },
        { key: 'lastName', header: 'Last Name', render: (row: UserRow) => row.lastName },
        { key: 'email', header: 'Email', render: (row: UserRow) => row.email },
        { key: 'role', header: 'Role', render: (row: UserRow) => row.role },
        {
            key: 'action',
            header: 'Action',
            render: (row: UserRow) => (
                <div className='flex items-center gap-2'>
                    <select
                        value={selectedRoleByUserId[row.id] ?? ''}
                        onChange={(event) =>
                            setSelectedRoleByUserId((prev) => ({
                                ...prev,
                                [row.id]: event.target.value,
                            }))
                        }
                        className='rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800'
                    >
                        <option value='' disabled>
                            Select role
                        </option>
                        {availableRoles.map((role) => (
                            <option key={role} value={role}>
                                {role}
                            </option>
                        ))}
                    </select>

                    <button
                        type='button'
                        onClick={() => void handleChangeRole(row.id)}
                        className='rounded-md bg-[#a29bfe] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#8f86f8]'
                    >
                        Change
                    </button>

                    <button
                        type='button'
                        onClick={() => {
                            setEditingUser(row)
                            setIsEditModalOpen(true)
                        }}
                        className='rounded-md bg-[#7f74fa] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#6d62f6]'
                    >
                        Edit
                    </button>

                    <button
                        type='button'
                        onClick={() => {
                            setDeletingUser(row)
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
                row.firstName,
                row.lastName,
                row.email,
                row.role,
            ]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery),
        )
    }, [rows, searchQuery])

    return (
        <div className='min-h-screen bg-[#fd79a8]'>
            <Navbar />
            <main className='mx-auto w-full max-w-6xl px-4 pb-10 pt-6'>
                <h1 className='mb-6 text-center text-3xl font-extrabold tracking-tight text-white md:text-5xl'>Users</h1>

                {errorMessage ? <p className='mb-4 text-center text-sm font-medium text-red-100'>{errorMessage}</p> : null}

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
                        Create User
                    </button>
                </div>

                <DataTable
                    columns={columns}
                    rows={filteredRows}
                    rowKey={(row) => row.id}
                    emptyMessage={searchQuery.trim() ? 'No matching users found.' : 'No users yet.'}
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

                <ConfirmModal
                    isOpen={isDeleteModalOpen && deletingUser !== null}
                    title='Delete User'
                    message={`Are you sure you want to delete ${deletingUser?.email ?? 'this user'}?`}
                    confirmLabel='Delete User'
                    isLoading={isDeletingUser}
                    onCancel={() => {
                        setIsDeleteModalOpen(false)
                        setDeletingUser(null)
                    }}
                    onConfirm={handleDeleteUser}
                />

                <FormModal
                    isOpen={isCreateModalOpen}
                    title='Create User'
                    description='Create a new user account.'
                    submitLabel='Create User'
                    initialValues={{
                        firstName: '',
                        lastName: '',
                        email: '',
                        password: '',
                        roles: 'USER',
                    }}
                    fields={[
                        { name: 'firstName', label: 'First Name', placeholder: 'Ex: John' },
                        { name: 'lastName', label: 'Last Name', placeholder: 'Ex: Doe' },
                        { name: 'email', label: 'Email', placeholder: 'Ex: john@company.com', type: 'email' },
                        { name: 'password', label: 'Password', placeholder: 'Minimum 6 characters', type: 'password' },
                        {
                            name: 'roles',
                            label: 'Roles (comma-separated)',
                            placeholder: availableRoles.length > 0 ? availableRoles.join(', ') : 'USER',
                        },
                    ]}
                    validate={(values) => {
                        const errors: Partial<Record<string, string>> = {}
                        const email = values.email?.trim() ?? ''
                        const password = values.password?.trim() ?? ''
                        const roles = parseRoles(values.roles ?? '')

                        if (!email) {
                            errors.email = 'Email is required.'
                        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            errors.email = 'Please enter a valid email.'
                        }

                        if (!password) {
                            errors.password = 'Password is required.'
                        } else if (password.length < 6) {
                            errors.password = 'Password must be at least 6 characters.'
                        }

                        if (roles.length === 0) {
                            errors.roles = 'At least one role is required.'
                        } else if (hasUnknownRoles(roles)) {
                            errors.roles = 'One or more roles are invalid.'
                        }

                        return errors
                    }}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={async (values) => {
                        const created = await handleCreateUser(values)
                        if (created) {
                            setIsCreateModalOpen(false)
                        }
                    }}
                />

                <FormModal
                    isOpen={isEditModalOpen && editingUser !== null}
                    title='Edit User'
                    description='Update user information and roles.'
                    submitLabel='Save Changes'
                    initialValues={{
                        firstName: editingUser?.firstName === '-' ? '' : (editingUser?.firstName ?? ''),
                        lastName: editingUser?.lastName === '-' ? '' : (editingUser?.lastName ?? ''),
                        email: editingUser?.email ?? '',
                        password: '',
                        roles: editingUser?.role ?? 'USER',
                    }}
                    fields={[
                        { name: 'firstName', label: 'First Name', placeholder: 'Ex: John' },
                        { name: 'lastName', label: 'Last Name', placeholder: 'Ex: Doe' },
                        { name: 'email', label: 'Email', placeholder: 'Ex: john@company.com', type: 'email' },
                        { name: 'password', label: 'Password (optional)', placeholder: 'Leave blank to keep unchanged', type: 'password' },
                        {
                            name: 'roles',
                            label: 'Roles (comma-separated)',
                            placeholder: availableRoles.length > 0 ? availableRoles.join(', ') : 'USER',
                        },
                    ]}
                    validate={(values) => {
                        const errors: Partial<Record<string, string>> = {}
                        const email = values.email?.trim() ?? ''
                        const password = values.password?.trim() ?? ''
                        const roles = parseRoles(values.roles ?? '')

                        if (!email) {
                            errors.email = 'Email is required.'
                        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            errors.email = 'Please enter a valid email.'
                        }

                        if (password && password.length < 6) {
                            errors.password = 'Password must be at least 6 characters.'
                        }

                        if (roles.length === 0) {
                            errors.roles = 'At least one role is required.'
                        } else if (hasUnknownRoles(roles)) {
                            errors.roles = 'One or more roles are invalid.'
                        }

                        return errors
                    }}
                    onClose={() => {
                        setIsEditModalOpen(false)
                        setEditingUser(null)
                    }}
                    onSubmit={async (values) => {
                        const updated = await handleEditUser(values)
                        if (updated) {
                            setIsEditModalOpen(false)
                            setEditingUser(null)
                        }
                    }}
                />
            </main>
        </div>
    )
}

export default UsersPage
