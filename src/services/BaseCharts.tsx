import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts"
type chartProps = {
    data: { value: number | undefined }[]
}
export function BaseChartProps(props: chartProps) {
    return (
        <ResponsiveContainer
            width="100%"
            height="100%">
            <AreaChart data={props.data}>
                <CartesianGrid
                    strokeDasharray="5 5"
                    stroke="#333"
                    fill="#1C1C1C"
                />
                <Area
                    fillOpacity={0.3}
                    type="monotone"
                    dataKey="value"
                    stroke="#5DD4EE"
                    fill="#0A4D5C"
                    strokeWidth={3}
                    // isAnimationActive={false}
                />
                <XAxis
                    stroke="transparent"
                    height={0}
                />
                <YAxis
                    domain={[0, 200]}
                    stroke="transparent"
                    width={0}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
