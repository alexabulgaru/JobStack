import type { TableSearchProps } from '../common/types'

function TableSearch({ value, onChange }: TableSearchProps) {
    return (
        <div className='mb-4 flex justify-center'>
            <input
                type='text'
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder='Search'
                className='w-full max-w-md rounded-md border border-white/50 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#a29bfe]/40'
            />
        </div>
    )
}

export default TableSearch
