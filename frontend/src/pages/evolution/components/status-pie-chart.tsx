import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { EvolutionChartProps } from '../../../common/types'

const PIE_COLORS = ['#a29bfe', '#55efc4', '#ff7675', '#74b9ff', '#ffeaa7', '#fab1a0']

function StatusPieChart({ title, data, emptyMessage }: EvolutionChartProps) {
    const chartData = data.map((item) => ({
        name: item.label,
        value: item.value,
    }))

    return (
        <section className='rounded-2xl border border-white/30 bg-white/95 p-5 shadow-xl'>
            <h2 className='text-lg font-extrabold text-slate-800'>{title}</h2>

            {chartData.length === 0 ? (
                <p className='mt-4 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-600'>{emptyMessage}</p>
            ) : (
                <div className='mt-4 h-[320px] w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                            <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
                            <Legend />
                            <Pie
                                data={chartData}
                                dataKey='value'
                                nameKey='name'
                                cx='50%'
                                cy='50%'
                                outerRadius={96}
                                innerRadius={45}
                                paddingAngle={3}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    )
}

export default StatusPieChart
