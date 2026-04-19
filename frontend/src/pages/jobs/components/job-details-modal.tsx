import { useNavigate } from 'react-router-dom'
import type { JobDetailsModalProps } from '../../../common/types'

function JobDetailsModal({ selectedJob, onDelete, onClose }: JobDetailsModalProps) {
    const navigate = useNavigate()

    if (!selectedJob) {
        return null
    }

    return (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4'>
            <div className='w-full max-w-xl rounded-2xl border border-white/30 bg-white p-6 shadow-2xl'>
                <h3 className='text-xl font-extrabold text-slate-800'>
                    {selectedJob.companyName} - {selectedJob.jobTitle}
                </h3>

                <div className='mt-4 space-y-2 text-sm text-slate-700'>
                    <p>
                        <span className='font-bold'>Status:</span> {selectedJob.status ?? 'No status'}
                    </p>
                    <p>
                        <span className='font-bold'>Applied date:</span> {selectedJob.appliedDate ?? '-'}
                    </p>
                    <p>
                        <span className='font-bold'>Link / HR contact:</span> {selectedJob.hrContactEmail ?? '-'}
                    </p>
                    <p>
                        <span className='font-bold'>Notes:</span> {selectedJob.description || '-'}
                    </p>
                    <p>
                        <span className='font-bold'>Timeline:</span>
                    </p>
                    <p className='whitespace-pre-wrap rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700'>
                        {selectedJob.timeline || '-'}
                    </p>
                    <p>
                        <span className='font-bold'>Tags:</span> {(selectedJob.tags ?? []).join(', ') || '-'}
                    </p>
                </div>

                <div className='mt-5 flex flex-wrap items-center justify-end gap-2'>
                    <button
                        type='button'
                        onClick={onDelete}
                        className='rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100'
                    >
                        Delete
                    </button>
                    <button
                        type='button'
                        onClick={() => navigate(`/jobs/edit/${selectedJob.id}`)}
                        className='rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
                    >
                        Add More Details
                    </button>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-md bg-[#a29bfe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8f86f8]'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default JobDetailsModal
