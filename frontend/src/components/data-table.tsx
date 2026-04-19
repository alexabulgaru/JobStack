import type { DataTableProps } from '../common/types'

function DataTable<T>({ columns, rows, rowKey, emptyMessage = 'No data available.' }: DataTableProps<T>) {
    return (
        <div className='overflow-hidden rounded-2xl border border-white/30 bg-white/95 shadow-2xl'>
            <div className='overflow-x-auto'>
                <table className='min-w-full border-collapse text-left text-sm text-slate-700'>
                    <thead className='bg-[#a29bfe] text-white'>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className={`px-4 py-3 font-semibold ${column.className ?? ''}`}>
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className='px-4 py-8 text-center text-slate-500'>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, index) => (
                                <tr key={rowKey(row, index)} className='border-t border-slate-200'>
                                    {columns.map((column) => (
                                        <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                                            {column.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DataTable
