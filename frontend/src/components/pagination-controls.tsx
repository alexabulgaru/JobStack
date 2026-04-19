import type { PageResponse, PaginationControlsProps, ResolvedPaginationState } from '../common/types'

export function resolvePaginationState<T>(
    data: PageResponse<T>,
    fallbackPage: number,
    pageSizeFallback: number,
    currentItemsCount: number,
): ResolvedPaginationState {
    const parsedPageNumber = Number(data.page?.number ?? data.number)
    const parsedTotalPages = Number(data.page?.totalPages ?? data.totalPages)
    const parsedTotalElements = Number(data.page?.totalElements ?? data.totalElements)
    const parsedSize = Number(data.page?.size ?? data.size)

    const resolvedPageNumber =
        Number.isFinite(parsedPageNumber) && parsedPageNumber >= 0 ? parsedPageNumber : fallbackPage

    const sizeForCalculation =
        Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : pageSizeFallback

    const totalPagesFromElements =
        Number.isFinite(parsedTotalElements) && parsedTotalElements >= 0
            ? Math.ceil(parsedTotalElements / sizeForCalculation)
            : 0

    const totalPagesFromResponse =
        Number.isFinite(parsedTotalPages) && parsedTotalPages >= 0
            ? parsedTotalPages
            : 0

    const resolvedTotalPages =
        Math.max(totalPagesFromResponse, totalPagesFromElements) > 0
            ? Math.max(totalPagesFromResponse, totalPagesFromElements)
            : currentItemsCount > 0
                ? 1
                : 0

    const isFirstPage =
        typeof data.first === 'boolean'
            ? data.first
            : resolvedPageNumber === 0

    const isLastPage =
        typeof data.last === 'boolean'
            ? data.last
            : resolvedTotalPages > 0
                ? resolvedPageNumber + 1 >= resolvedTotalPages
                : currentItemsCount < pageSizeFallback

    return {
        resolvedPageNumber,
        resolvedTotalPages,
        isFirstPage,
        isLastPage,
    }
}

function PaginationControls({
    loading,
    isFirstPage,
    isLastPage,
    currentPage,
    totalPages,
    onPrev,
    onNext,
}: PaginationControlsProps) {
    return (
        <div className='mt-4 flex items-center justify-center gap-3'>
            <button
                type='button'
                disabled={loading || isFirstPage}
                onClick={onPrev}
                className='rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40'
            >
                Prev
            </button>

            <span className='text-sm font-semibold text-white'>
                Page {totalPages === 0 ? 0 : currentPage + 1} / {totalPages}
            </span>

            <button
                type='button'
                disabled={loading || isLastPage}
                onClick={onNext}
                className='rounded-md border border-white/40 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40'
            >
                Next
            </button>
        </div>
    )
}

export default PaginationControls
