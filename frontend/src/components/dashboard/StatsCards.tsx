import { Box, Card, CardContent, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PeopleIcon from '@mui/icons-material/People';
import DoorFrontIcon from '@mui/icons-material/DoorFront';

interface StatsCardsProps {
    stats: {
        totalLocks: number;
        activeLocks: number;
        inactiveLocks: number;
        totalUsers: number;
    };
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: 'Total de Fechaduras',
            value: stats.totalLocks,
            icon: <DoorFrontIcon sx={{ fontSize: 40, color: '#0f62fe' }} />,
            color: '#eff6ff',
        },
        {
            title: 'Fechaduras Ativas',
            value: stats.activeLocks,
            icon: <LockOpenIcon sx={{ fontSize: 40, color: '#0284c7' }} />,
            color: '#e0f2fe',
        },
        {
            title: 'Fechaduras Inativas',
            value: stats.inactiveLocks,
            icon: <LockIcon sx={{ fontSize: 40, color: '#475569' }} />,
            color: '#f1f5f9',
        },
        {
            title: 'Total de Usuários',
            value: stats.totalUsers,
            icon: <PeopleIcon sx={{ fontSize: 40, color: '#1d4ed8' }} />,
            color: '#dbeafe',
        },
    ];

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 3,
            }}
        >
            {cards.map((card, index) => (
                <Card
                    key={index}
                    sx={{
                        backgroundColor: card.color,
                        border: '1px solid #d7e3f5',
                        boxShadow: '0 18px 45px rgba(15,35,89,0.08)',
                        borderRadius: 4,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 24px 55px rgba(15,35,89,0.14)',
                        },
                    }}
                >
                    <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="body2" color="#64748b" gutterBottom>
                                    {card.title}
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="#0f172a">
                                    {card.value}
                                </Typography>
                            </Box>
                            <Box>{card.icon}</Box>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
