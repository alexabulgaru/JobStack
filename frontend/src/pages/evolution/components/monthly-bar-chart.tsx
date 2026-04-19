import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import type { EvolutionChartProps } from '../../../common/types'

function MonthlyBarChart({ title, data, emptyMessage }: EvolutionChartProps) {
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
                        <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 50 }}>
                            <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                            <XAxis
                                dataKey='name'
                                angle={-25}
                                textAnchor='end'
                                interval={0}
                                tick={{ fontSize: 12, fill: '#475569' }}
                                height={70}
                            />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(162,155,254,0.12)' }}
                                contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                            />
                            <Legend />
                            <Bar dataKey='value' name='Applications' fill='#a29bfe' radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    )
}

export default MonthlyBarChart
