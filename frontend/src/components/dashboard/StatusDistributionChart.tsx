import { Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatusDistributionChartProps {
    data: Array<{
        name: string;
        value: number;
    }>;
}

const COLORS = ['#0f62fe', '#64748b'];

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
    return (
        <Card sx={{ border: '1px solid #d7e3f5', boxShadow: '0 18px 45px rgba(15,35,89,0.08)', borderRadius: 4 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="#0f172a">
                    Distribuição de Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#0f62fe"
                            dataKey="value"
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
