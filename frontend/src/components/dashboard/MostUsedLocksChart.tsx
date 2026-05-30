import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MostUsedLocksChartProps {
    data: Array<{
        id: number;
        name: string;
        usageCount: number;
    }>;
}

export default function MostUsedLocksChart({ data }: MostUsedLocksChartProps) {
    return (
        <Card sx={{ border: '1px solid #d7e3f5', boxShadow: '0 18px 45px rgba(15,35,89,0.08)', borderRadius: 4 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="#0f172a">
                    Fechaduras Mais Utilizadas
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d7e3f5" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="usageCount" fill="#0f62fe" name="Número de Usos" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
