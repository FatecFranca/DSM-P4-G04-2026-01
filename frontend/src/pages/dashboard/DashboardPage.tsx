import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, CircularProgress, Button, Stack, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '../../contexts/AuthContext';
import { statisticsService } from '../../services/statisticsService';
import StatsCards from '../../components/dashboard/StatsCards';
import UsageTimelineChart from '../../components/dashboard/UsageTimelineChart';
import MostUsedLocksChart from '../../components/dashboard/MostUsedLocksChart';
import StatusDistributionChart from '../../components/dashboard/StatusDistributionChart';
import RecentActivityTable from '../../components/dashboard/RecentActivityTable';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = import.meta.env.VITE_API_URL;

export default function DashboardPage() {
    const navigate = useNavigate();
    const { isLoggedIn, isLoading, user } = useAuth();
    const dashboardRef = useRef<HTMLDivElement>(null);

    const [overview, setOverview] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [mostUsed, setMostUsed] = useState<any[]>([]);
    const [statusDist, setStatusDist] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; type: 'success' | 'error' | 'info' }>(
        { open: false, msg: '', type: 'info' }
    );

    useEffect(() => {
        if (!isLoggedIn && !isLoading) {
            navigate('/');
            return;
        }
        if (isLoggedIn) {
            loadDashboardData();
        }
    }, [isLoggedIn, isLoading, navigate]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [overviewData, timelineData, mostUsedData, statusDistData, activityData] =
                await Promise.all([
                    statisticsService.getOverview(),
                    statisticsService.getUsageTimeline(),
                    statisticsService.getMostUsed(),
                    statisticsService.getStatusDistribution(),
                    statisticsService.getRecentActivity(),
                ]);
            setOverview(overviewData);
            setTimeline(timelineData);
            setMostUsed(mostUsedData);
            setStatusDist(statusDistData);
            setRecentActivity(activityData);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            setSnack({ open: true, msg: 'Erro ao carregar dados do dashboard.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const authHeaders = () => {
        const token = Cookies.get('authToken');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const handleSeed = async () => {
        try {
            setBusy(true);
            const r = await axios.post(`${API_URL}/door-locks/statistics/seed-demo`, {}, authHeaders());
            setSnack({ open: true, msg: r.data?.message || 'Dados demo gerados.', type: 'success' });
            await loadDashboardData();
        } catch (e: any) {
            setSnack({ open: true, msg: 'Falha ao popular dados demo.', type: 'error' });
        } finally {
            setBusy(false);
        }
    };

    const handleClearDemo = async () => {
        if (!confirm('Tem certeza que deseja remover os eventos de demonstração? Eventos reais serão preservados.')) return;
        try {
            setBusy(true);
            const r = await axios.delete(`${API_URL}/door-locks/statistics/seed-demo`, authHeaders());
            setSnack({ open: true, msg: `${r.data?.removed ?? 0} eventos demo removidos.`, type: 'success' });
            await loadDashboardData();
        } catch (e: any) {
            setSnack({ open: true, msg: 'Falha ao limpar dados demo.', type: 'error' });
        } finally {
            setBusy(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!dashboardRef.current) return;
        try {
            setBusy(true);
            setSnack({ open: true, msg: 'Gerando PDF... pode levar alguns segundos.', type: 'info' });

            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8fbff',
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');

            // A4 retrato em mm: 210 x 297
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const marginX = 10;
            const usableWidth = pageWidth - marginX * 2;

            // converte canvas px -> mm proporcionalmente
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.width / imgProps.height;
            const imgHeight = usableWidth / ratio;

            // capa
            pdf.setFillColor(15, 98, 254);
            pdf.rect(0, 0, pageWidth, 32, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.text('Dashboard TrancAi', marginX, 14);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Relatório de Estatísticas das Fechaduras', marginX, 22);
            pdf.setFontSize(9);
            const now = new Date().toLocaleString('pt-BR');
            pdf.text(`Gerado em ${now} • ${user?.name || ''}`, marginX, 28);

            // se a imagem for maior que a pagina, vai paginando
            const startY = 38;
            const remainingHeight = pageHeight - startY - 8;
            if (imgHeight <= remainingHeight) {
                pdf.addImage(imgData, 'PNG', marginX, startY, usableWidth, imgHeight);
            } else {
                // estrategia simples: adiciona a imagem em pedacos verticais
                const pxPerMm = imgProps.width / usableWidth;
                const pageContentHeightMm = remainingHeight;
                const pageContentHeightPx = pageContentHeightMm * pxPerMm;

                let renderedPx = 0;
                let isFirstPage = true;
                while (renderedPx < imgProps.height) {
                    const sliceHeightPx = Math.min(pageContentHeightPx, imgProps.height - renderedPx);

                    // recorta o pedaco da imagem original
                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = imgProps.width;
                    sliceCanvas.height = sliceHeightPx;
                    const ctx = sliceCanvas.getContext('2d');
                    if (!ctx) break;
                    const fullImg = new Image();
                    fullImg.src = imgData;
                    await new Promise((res) => { fullImg.onload = res; });
                    ctx.drawImage(fullImg, 0, -renderedPx);
                    const sliceData = sliceCanvas.toDataURL('image/png');

                    if (!isFirstPage) pdf.addPage();
                    const yPos = isFirstPage ? startY : 10;
                    pdf.addImage(
                        sliceData,
                        'PNG',
                        marginX,
                        yPos,
                        usableWidth,
                        sliceHeightPx / pxPerMm
                    );
                    renderedPx += sliceHeightPx;
                    isFirstPage = false;
                }
            }

            const filename = `trancai-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(filename);
            setSnack({ open: true, msg: 'PDF baixado com sucesso!', type: 'success' });
        } catch (e: any) {
            console.error('Erro ao gerar PDF:', e);
            setSnack({ open: true, msg: 'Erro ao gerar PDF.', type: 'error' });
        } finally {
            setBusy(false);
        }
    };

    if (isLoading || loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                sx={{ background: 'linear-gradient(180deg, #f8fbff 0%, #edf5ff 100%)' }}
            >
                <CircularProgress sx={{ color: '#0f62fe' }} />
            </Box>
        );
    }

    return (
        <Box
            minHeight="100vh"
            py={4}
            sx={{ background: 'linear-gradient(180deg, #f8fbff 0%, #edf5ff 100%)' }}
        >
            <Container maxWidth="xl">
                <Box
                    mb={4}
                    sx={{
                        backgroundColor: 'rgba(255,255,255,0.88)',
                        border: '1px solid #d7e3f5',
                        borderRadius: 4,
                        boxShadow: '0 18px 45px rgba(15,35,89,0.08)',
                        p: { xs: 3, md: 4 },
                    }}
                >
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={2}
                        mb={2}
                    >
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/')}
                            sx={{ color: '#0f62fe', fontWeight: 700, borderRadius: 3 }}
                        >
                            Voltar
                        </Button>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                startIcon={<AutoFixHighIcon />}
                                onClick={handleSeed}
                                disabled={busy}
                                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                            >
                                Popular dados demo
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<DeleteSweepIcon />}
                                onClick={handleClearDemo}
                                disabled={busy}
                                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
                            >
                                Limpar dados demo
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={handleDownloadPDF}
                                disabled={busy}
                                sx={{
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    backgroundColor: '#0f62fe',
                                    '&:hover': { backgroundColor: '#0950d4' },
                                }}
                            >
                                Baixar PDF
                            </Button>
                        </Stack>
                    </Stack>

                    <Typography variant="overline" color="#0f62fe" fontWeight="bold">
                        Métricas em tempo real
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" gutterBottom color="#0f172a">
                        Dashboard de Estatísticas
                    </Typography>
                    <Typography variant="body1" color="#64748b">
                        Visualize métricas e análises do sistema de fechaduras.
                    </Typography>
                </Box>

                {/* tudo abaixo deste ref vira PDF */}
                <Box ref={dashboardRef}>
                    {overview && (
                        <Box mb={4}>
                            <StatsCards stats={overview} />
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                            gap: 3,
                            mb: 3,
                        }}
                    >
                        <UsageTimelineChart data={timeline} />
                        <StatusDistributionChart data={statusDist} />
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                            gap: 3,
                        }}
                    >
                        <MostUsedLocksChart data={mostUsed} />
                        <RecentActivityTable data={recentActivity} />
                    </Box>
                </Box>
            </Container>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snack.type}
                    onClose={() => setSnack({ ...snack, open: false })}
                    sx={{ borderRadius: 3, fontWeight: 600 }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
