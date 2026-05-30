import { Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UsageTimelineChartProps {
    data: Array<{
        date: string;
        opens: number;
        closes: number;
    }>;
}

export default function UsageTimelineChart({ data }: UsageTimelineChartProps) {
    return (
        <Card sx={{ border: '1px solid #d7e3f5', boxShadow: '0 18px 45px rgba(15,35,89,0.08)', borderRadius: 4 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="#0f172a">
                    Histórico de Uso (Últimos 7 dias)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d7e3f5" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="opens" stroke="#0f62fe" strokeWidth={3} name="Aberturas" />
                        <Line type="monotone" dataKey="closes" stroke="#64748b" strokeWidth={3} name="Fechamentos" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
