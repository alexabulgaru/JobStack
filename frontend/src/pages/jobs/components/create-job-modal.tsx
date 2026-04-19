import type { CreateJobModalProps } from '../../../common/types'

function CreateJobModal({
    isOpen,
    draft,
    statuses,
    tags,
    createLoading,
    onClose,
    onSave,
    onDraftChange,
    onToggleTag,
}: CreateJobModalProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4'>
            <div className='w-full max-w-2xl rounded-2xl border border-white/30 bg-white p-6 shadow-2xl'>
                <h3 className='text-xl font-extrabold text-slate-800'>Add Job</h3>

                <div className='mt-4 grid gap-3 md:grid-cols-2'>
                    <label className='text-sm font-semibold text-slate-700'>
                        Company Name
                        <input
                            type='text'
                            value={draft.companyName}
                            onChange={(event) => onDraftChange({ ...draft, companyName: event.target.value })}
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        />
                    </label>

                    <label className='text-sm font-semibold text-slate-700'>
                        Job Title
                        <input
                            type='text'
                            value={draft.jobTitle}
                            onChange={(event) => onDraftChange({ ...draft, jobTitle: event.target.value })}
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        />
                    </label>

                    <label className='text-sm font-semibold text-slate-700'>
                        Status
                        <select
                            value={draft.statusId}
                            onChange={(event) => onDraftChange({ ...draft, statusId: event.target.value })}
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        >
                            <option value=''>Select status</option>
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className='text-sm font-semibold text-slate-700'>
                        Applied Date
                        <input
                            type='date'
                            value={draft.appliedDate}
                            onChange={(event) => onDraftChange({ ...draft, appliedDate: event.target.value })}
                            className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                        />
                    </label>
                </div>

                <label className='mt-3 block text-sm font-semibold text-slate-700'>
                    Notes
                    <textarea
                        rows={3}
                        value={draft.description}
                        onChange={(event) => onDraftChange({ ...draft, description: event.target.value })}
                        className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                    />
                </label>

                <label className='mt-3 block text-sm font-semibold text-slate-700'>
                    Link / HR Contact
                    <input
                        type='text'
                        value={draft.hrContactEmail}
                        onChange={(event) => onDraftChange({ ...draft, hrContactEmail: event.target.value })}
                        placeholder='https://... or hr@company.com'
                        className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
                    />
                </label>

                <div className='mt-3'>
                    <p className='text-sm font-semibold text-slate-700'>Tags</p>
                    <div className='mt-2 flex flex-wrap gap-2'>
                        {tags.map((tag) => {
                            const active = draft.tagIds.includes(tag.id)
                            return (
                                <button
                                    key={tag.id}
                                    type='button'
                                    onClick={() => onToggleTag(tag.id)}
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

                <div className='mt-5 flex items-center justify-end gap-2'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100'
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        onClick={onSave}
                        disabled={createLoading}
                        className='rounded-md bg-[#a29bfe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8f86f8] disabled:opacity-60'
                    >
                        Save Job
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateJobModal
