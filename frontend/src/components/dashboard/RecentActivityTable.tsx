import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';

interface RecentActivityTableProps {
    data: Array<{
        id: number;
        lockName: string;
        action: string;
        user: string;
        timestamp: string;
    }>;
}

export default function RecentActivityTable({ data }: RecentActivityTableProps) {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card sx={{ border: '1px solid #d7e3f5', boxShadow: '0 18px 45px rgba(15,35,89,0.08)', borderRadius: 4 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="#0f172a">
                    Atividades Recentes
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& th': { color: '#475569', borderBottomColor: '#d7e3f5' } }}>
                                <TableCell><strong>Fechadura</strong></TableCell>
                                <TableCell><strong>Ação</strong></TableCell>
                                <TableCell><strong>Usuário</strong></TableCell>
                                <TableCell><strong>Data/Hora</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((activity) => (
                                <TableRow key={activity.id} hover sx={{ '& td': { borderBottomColor: '#eef4ff' } }}>
                                    <TableCell>{activity.lockName}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={activity.action}
                                            size="small"
                                            sx={{
                                                backgroundColor: activity.action === 'OPEN' ? '#dbeafe' : '#f1f5f9',
                                                color: activity.action === 'OPEN' ? '#0f62fe' : '#475569',
                                                fontWeight: 700,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{activity.user}</TableCell>
                                    <TableCell>{formatTimestamp(activity.timestamp)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}
