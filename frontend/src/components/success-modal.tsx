import { useEffect } from 'react'
import type { SuccessModalProps } from '../common/types'

function SuccessModal({
    isOpen,
    title = 'Success',
    message,
    buttonLabel = 'OK',
    autoCloseMs = 2500,
    onClose,
}: SuccessModalProps) {
    useEffect(() => {
        if (!isOpen || autoCloseMs <= 0) {
            return
        }

        const timer = window.setTimeout(() => {
            onClose()
        }, autoCloseMs)

        return () => {
            window.clearTimeout(timer)
        }
    }, [isOpen, autoCloseMs, onClose])

    if (!isOpen) {
        return null
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4'>
            <div className='w-full max-w-xs rounded-none border-2 border-white bg-white p-4 shadow-2xl'>
                <div className='flex justify-end'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-md px-2 py-1 text-xs font-bold text-[#fd79a8] hover:bg-pink-50'
                        aria-label='Close success notification'
                    >
                        x
                    </button>
                </div>

                <h3 className='mt-1 text-center text-sm font-extrabold uppercase tracking-wide text-[#fd79a8]'>
                    {title}
                </h3>
                <p className='mt-1 text-center text-base font-extrabold text-[#fd79a8]'>{message}</p>

                <button
                    type='button'
                    onClick={onClose}
                    className='mt-4 w-full rounded-xl bg-gradient-to-r from-[#fd79a8] to-[#f66aa0] py-2.5 text-sm font-extrabold tracking-wide text-white shadow-md shadow-pink-300/60 transition hover:from-[#f66aa0] hover:to-[#ee5f97] hover:shadow-lg hover:shadow-pink-300/70 active:scale-[0.98]'
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    )
}

export default SuccessModal
