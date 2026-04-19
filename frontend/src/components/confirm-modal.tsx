import type { ConfirmModalProps } from '../common/types'

function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    isLoading = false,
    onCancel,
    onConfirm,
}: ConfirmModalProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
            <div className='w-full max-w-sm rounded-2xl border border-red-100 bg-white p-5 shadow-2xl'>
                <h2 className='text-lg font-extrabold text-red-500'>{title}</h2>
                <p className='mt-2 text-sm font-medium text-slate-700'>{message}</p>

                <div className='mt-5 flex items-center justify-end gap-2'>
                    <button
                        type='button'
                        onClick={onCancel}
                        disabled={isLoading}
                        className='rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60'
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type='button'
                        onClick={() => void onConfirm()}
                        disabled={isLoading}
                        className='rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:from-red-600 hover:to-red-700 disabled:opacity-60'
                    >
                        {isLoading ? 'Deleting...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmModal
