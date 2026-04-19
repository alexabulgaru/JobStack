import type { JobsKanbanBoardProps } from "../../../common/types"

function JobsKanbanBoard({
    jobsByStatus,
    draggedJobId,
    dropStatusName,
    onDragStart,
    onDragEnd,
    onDropStatus,
    onDropStatusHover,
    onSelectJob,
}: JobsKanbanBoardProps) {
    return (
        <div className='grid gap-4 lg:grid-cols-3'>
            {jobsByStatus.map(({ statusName, jobs }) => (
                <section
                    key={statusName}
                    onDragOver={(event) => {
                        event.preventDefault()
                        onDropStatusHover(statusName)
                    }}
                    onDragLeave={() => {
                        onDropStatusHover((dropStatusName === statusName ? null : dropStatusName))
                    }}
                    onDrop={(event) => {
                        event.preventDefault()
                        onDropStatus(statusName)
                    }}
                    className={`rounded-xl border p-3 shadow-lg transition ${dropStatusName === statusName
                        ? 'border-[#a29bfe] bg-[#f4f3ff]'
                        : 'border-white/30 bg-white/90'
                        }`}
                >
                    <header className='mb-3 flex items-center justify-between rounded-md bg-slate-100 px-3 py-2'>
                        <h2 className='text-sm font-extrabold uppercase tracking-wide text-slate-700'>{statusName}</h2>
                        <span className='rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600'>{jobs.length}</span>
                    </header>

                    <div className='space-y-3'>
                        {jobs.length === 0 ? (
                            <p className='rounded-md border border-dashed border-slate-300 p-3 text-xs font-semibold text-slate-500'>
                                No jobs in this status.
                            </p>
                        ) : (
                            jobs.map((job) => (
                                <button
                                    key={job.id}
                                    type='button'
                                    draggable
                                    onDragStart={() => onDragStart(job.id)}
                                    onDragEnd={onDragEnd}
                                    onClick={() => onSelectJob(job)}
                                    className={`w-full rounded-lg border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow ${draggedJobId === job.id ? 'border-[#a29bfe] opacity-70' : 'border-slate-200'
                                        }`}
                                >
                                    <p className='text-sm font-extrabold text-slate-800'>{job.companyName}</p>
                                    <p className='text-xs font-semibold text-slate-600'>{job.jobTitle}</p>
                                    <p className='mt-2 line-clamp-2 text-xs text-slate-500'>
                                        {job.description || 'No notes yet'}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </section>
            ))}
        </div>
    )
}

export default JobsKanbanBoard
