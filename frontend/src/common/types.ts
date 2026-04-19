import type { ReactNode } from 'react'

export type User = {
    id: number
    firstName: string
    lastName: string
    email: string
    roles: string[]
}

export type UserContextValue = {
    user: User | null
    loading: boolean
    error: string | null
    refreshMe: () => Promise<void>
    clearUser: () => void
}

export type RegisterFormValues = {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
}

export type LoginFormValues = {
    email: string
    password: string
}

export type SecureStorageApi = {
    getItem: (key: string) => unknown
    setItem: (key: string, value: unknown) => void
    removeItem: (key: string) => void
}

export type TableColumn<T> = {
    key: string
    header: string
    className?: string
    render: (row: T) => ReactNode
}

export type DataTableProps<T> = {
    columns: TableColumn<T>[]
    rows: T[]
    rowKey: (row: T, index: number) => string | number
    emptyMessage?: string
}

export type PaginationControlsProps = {
    loading: boolean
    isFirstPage: boolean
    isLastPage: boolean
    currentPage: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
}

export type TableSearchProps = {
    value: string
    onChange: (value: string) => void
}

export type FormModalField = {
    name: string
    label: string
    placeholder?: string
    type?: 'text' | 'email' | 'password' | 'select'
    options?: Array<{
        label: string
        value: string
    }>
}

export type FormModalProps = {
    isOpen: boolean
    title: string
    description?: string
    submitLabel: string
    initialValues: Record<string, string>
    fields: FormModalField[]
    onClose: () => void
    onSubmit: (values: Record<string, string>) => Promise<void>
    validate?: (values: Record<string, string>) => Partial<Record<string, string>>
}

export type ConfirmModalProps = {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    isLoading?: boolean
    onCancel: () => void
    onConfirm: () => Promise<void>
}

export type SuccessModalProps = {
    isOpen: boolean
    title?: string
    message: string
    buttonLabel?: string
    autoCloseMs?: number
    onClose: () => void
}

export type ResolvedPaginationState = {
    resolvedPageNumber: number
    resolvedTotalPages: number
    isFirstPage: boolean
    isLastPage: boolean
}

export type UserRow = {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
}

export type PageResponse<T> = {
    content: T[]
    page?: {
        size: number
        number: number
        totalElements: number
        totalPages: number
    }
    number?: number
    size?: number
    totalElements?: number
    totalPages?: number
    first?: boolean
    last?: boolean
}

export type AdminUserDto = {
    id: number
    firstName: string
    lastName: string
    email: string
    roles: string[]
}

export type RoleDto = {
    id: number
    name: string
}

export type RoleRow = {
    id: number
    name: string
}

export type TagRow = {
    id: number
    name: string
}

export type StatusRow = {
    id: number
    name: string
}

export type FeedbackRow = {
    id: number
    category: string
    rating: number
    contactConsent: boolean
    comments: string
    userEmail: string
    createdAt: string
}

export type JobApplicationDto = {
    id: number
    companyName: string
    jobTitle: string
    status: string | null
    tags: string[] | null
    description: string | null
    hrContactEmail: string | null
    userEmail: string | null
    appliedDate: string | null
    timeline: string | null
}

export type JobApplicationStatusDto = {
    id: number
    name: string
}

export type JobApplicationTagDto = {
    id: number
    name: string
}

export type JobDraft = {
    companyName: string
    jobTitle: string
    statusId: string
    appliedDate: string
    description: string
    hrContactEmail: string
    tagIds: number[]
}

export type JobsByStatus = {
    statusName: string
    jobs: JobApplicationDto[]
}

export type JobsKanbanBoardProps = {
    jobsByStatus: JobsByStatus[]
    draggedJobId: number | null
    dropStatusName: string | null
    onDragStart: (jobId: number) => void
    onDragEnd: () => void
    onDropStatus: (statusName: string) => void
    onDropStatusHover: (statusName: string | null) => void
    onSelectJob: (job: JobApplicationDto) => void
}

export type CreateJobModalProps = {
    isOpen: boolean
    draft: JobDraft
    statuses: JobApplicationStatusDto[]
    tags: JobApplicationTagDto[]
    createLoading: boolean
    onClose: () => void
    onSave: () => void
    onDraftChange: (draft: JobDraft) => void
    onToggleTag: (tagId: number) => void
}

export type JobDetailsModalProps = {
    selectedJob: JobApplicationDto | null
    onDelete: () => void
    onClose: () => void
}

export type EvolutionStatsMap = Record<string, number>

export type EvolutionChartItem = {
    label: string
    value: number
}

export type EvolutionChartProps = {
    title: string
    data: EvolutionChartItem[]
    emptyMessage: string
}

export type UserFeedbackFormValues = {
    category: string
    rating: number
    contactConsent: boolean
    comments: string
    improvementAreas: string[]
}
