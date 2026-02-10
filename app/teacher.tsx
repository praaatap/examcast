import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { authService } from '@/services/auth';
import { CryptoService } from '@/services/crypto';
import { meshService } from '@/services/mesh';
import { useRouter } from 'expo-router';
import { LogOut, MessageSquare, QrCode, Send, ShieldCheck, Users, Wifi } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Easing, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { v4 as uuidv4 } from 'uuid';

type LogEntry = {
    text: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
};

export default function TeacherDashboard() {
    const router = useRouter();
    const [sessionActive, setSessionActive] = useState(false);
    const [message, setMessage] = useState('');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [connectedCount, setConnectedCount] = useState(0);
    const [showQR, setShowQR] = useState(false);
    const [qrContent, setQrContent] = useState('');
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const startSession = async () => {
        const session = authService.startSession();
        const qrData = JSON.stringify({
            id: session.id,
            key: session.key,
            name: 'Teacher'
        });
        setQrContent(qrData);

        await meshService.startServer();
        setSessionActive(true);
        setShowQR(true);
        startPulse();
        addLog(`Session started: ${session.id.substring(0, 8)}...`, 'success');
        addLog('Encryption key generated', 'info');
        addLog('Bluetooth server listening...', 'info');
    };

    const endSession = () => {
        authService.endSession();
        setSessionActive(false);
        pulseAnim.stopAnimation();
        addLog('Session ended', 'warning');
        router.back();
    };

    const broadcastMessage = async () => {
        if (!message.trim()) return;

        const session = authService.getSession();
        if (!session) {
            Alert.alert('Error', 'No active session');
            return;
        }

        const encryptedPayload = CryptoService.encrypt(message, session.key);
        const signature = CryptoService.sign(encryptedPayload, session.key);

        const packet = {
            id: uuidv4(),
            senderRole: 'TEACHER' as const,
            payload: encryptedPayload,
            ttl: 5,
            timestamp: Date.now(),
            signature: signature
        };

        await meshService.broadcast(packet);
        addLog(`Broadcast: "${message}"`, 'success');
        setMessage('');
    };

    const addLog = (text: string, type: LogEntry['type'] = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [{ text, type, timestamp }, ...prev]);
    };

    const getLogColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'success': return Colors.success;
            case 'warning': return Colors.warning;
            case 'error': return Colors.danger;
            default: return Colors.textSecondary;
        }
    };

    // ─── Pre-Session: Start Card ────────────────────────────────────────────
    if (!sessionActive) {
        return (
            <ScreenWrapper>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Teacher Dashboard</Text>
                        <Badge label="No Active Session" variant="neutral" />
                    </View>
                    <Button title="Exit" onPress={() => router.back()} variant="outline" size="small" icon={<LogOut size={14} color={Colors.primary} />} />
                </View>

                <View style={styles.centerContent}>
                    <GlowCard glowColor="primary" intensity="strong">
                        <View style={styles.startCardContent}>
                            <View style={styles.startIconBg}>
                                <ShieldCheck size={40} color={Colors.primaryLight} />
                            </View>
                            <Text style={styles.startTitle}>Ready to Start an Exam?</Text>
                            <Text style={styles.startDesc}>
                                This will generate a secure AES-256 encryption key and start the Bluetooth mesh broadcast server.
                            </Text>
                            <Button title="Start Exam Session" onPress={startSession} size="large" />
                        </View>
                    </GlowCard>
                </View>
            </ScreenWrapper>
        );
    }

    // ─── Active Session ─────────────────────────────────────────────────────
    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Teacher Dashboard</Text>
                    <Badge label="Session Active" variant="success" />
                </View>
                <Button title="End" onPress={endSession} variant="danger" size="small" icon={<LogOut size={14} color={Colors.text} />} />
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <Animated.View style={[styles.statCardWrapper, { transform: [{ scale: pulseAnim }] }]}>
                    <GlowCard glowColor="secondary">
                        <View style={styles.statContent}>
                            <Users size={20} color={Colors.secondary} />
                            <Text style={styles.statValue}>{connectedCount}</Text>
                            <Text style={styles.statLabel}>Connected</Text>
                        </View>
                    </GlowCard>
                </Animated.View>

                <GlowCard glowColor="primary" style={styles.statCardWrapper}>
                    <View style={styles.statContent}>
                        <ShieldCheck size={20} color={Colors.primaryLight} />
                        <Text style={styles.statValue}>Secure</Text>
                        <Text style={styles.statLabel}>Encrypted</Text>
                    </View>
                </GlowCard>

                <GlowCard glowColor="accent" style={styles.statCardWrapper}>
                    <View style={styles.statContent}>
                        <Button
                            title="QR"
                            onPress={() => setShowQR(true)}
                            size="small"
                            variant="outline"
                            icon={<QrCode size={14} color={Colors.primary} />}
                        />
                    </View>
                </GlowCard>
            </View>

            {/* Broadcast Section */}
            <GlowCard glowColor="primary" style={styles.broadcastCard}>
                <SectionHeader
                    title="Broadcast"
                    subtitle="Send encrypted messages to all students"
                    icon={<MessageSquare size={18} color={Colors.primaryLight} />}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Type exam instructions..."
                    placeholderTextColor={Colors.textMuted}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                />
                <Button
                    title="Send Broadcast"
                    onPress={broadcastMessage}
                    icon={<Send size={16} color={Colors.text} />}
                    disabled={!message.trim()}
                />
            </GlowCard>

            {/* Logs Section */}
            <View style={styles.logsSection}>
                <SectionHeader
                    title="System Logs"
                    icon={<Wifi size={16} color={Colors.textSecondary} />}
                />
                <ScrollView style={styles.logsContainer} showsVerticalScrollIndicator={false}>
                    {logs.map((log, index) => (
                        <View key={index} style={styles.logRow}>
                            <View style={[styles.logDot, { backgroundColor: getLogColor(log.type) }]} />
                            <Text style={[styles.logText, { color: getLogColor(log.type) }]}>{log.text}</Text>
                            <Text style={styles.logTime}>{log.timestamp}</Text>
                        </View>
                    ))}
                    {logs.length === 0 && (
                        <Text style={styles.emptyLogs}>Waiting for events...</Text>
                    )}
                </ScrollView>
            </View>

            {/* QR Modal */}
            <Modal visible={showQR} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <GlowCard glowColor="accent" intensity="strong" style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Scan to Join Exam</Text>
                        <View style={styles.qrWrapper}>
                            <View style={styles.qrContainer}>
                                {qrContent ? <QRCode value={qrContent} size={200} backgroundColor="white" color={Colors.background} /> : null}
                            </View>
                        </View>
                        <Text style={styles.modalSubtitle}>
                            Students scan this QR code to receive the encryption key securely over the camera — no internet required.
                        </Text>
                        <Button title="Close" onPress={() => setShowQR(false)} variant="outline" />
                    </GlowCard>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    headerTitle: {
        fontSize: FontSizes['2xl'],
        fontWeight: FontWeights.bold,
        color: Colors.text,
        marginBottom: 4,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.s,
    },
    startCardContent: {
        alignItems: 'center',
        padding: Spacing.m,
    },
    startIconBg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.m,
    },
    startTitle: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.s,
    },
    startDesc: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.s,
        marginBottom: Spacing.m,
    },
    statCardWrapper: {
        flex: 1,
    },
    statContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: FontSizes['2xl'],
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
    },
    broadcastCard: {
        marginBottom: Spacing.m,
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.m,
        padding: Spacing.m,
        color: Colors.text,
        fontSize: FontSizes.md,
        marginBottom: Spacing.m,
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: Colors.surfaceLight,
    },
    logsSection: {
        flex: 1,
    },
    logsContainer: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.m,
        padding: Spacing.m,
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.surfaceLight,
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
        marginBottom: 8,
    },
    logDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    logText: {
        fontFamily: 'monospace',
        fontSize: FontSizes.sm,
        flex: 1,
    },
    logTime: {
        fontFamily: 'monospace',
        fontSize: FontSizes.xs,
        color: Colors.textMuted,
    },
    emptyLogs: {
        color: Colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: Spacing.l,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        padding: Spacing.l,
    },
    modalCard: {
        // GlowCard provides padding
    },
    modalTitle: {
        fontSize: FontSizes['2xl'],
        fontWeight: FontWeights.bold,
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.l,
    },
    qrWrapper: {
        alignItems: 'center',
        marginBottom: Spacing.l,
    },
    qrContainer: {
        padding: Spacing.l,
        backgroundColor: 'white',
        borderRadius: BorderRadius.l,
    },
    modalSubtitle: {
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.l,
        lineHeight: 20,
        fontSize: FontSizes.md,
    },
});
