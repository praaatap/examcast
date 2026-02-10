import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GlowCard } from '@/components/ui/GlowCard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { authService } from '@/services/auth';
import { CryptoService } from '@/services/crypto';
import { MeshPacket, meshService } from '@/services/mesh';
import { StorageService } from '@/services/storage';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { Inbox, Lock, Radio, Scan, Unlock } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, AppState, BackHandler, Easing, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as LockTask from 'react-native-lock-task';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as NavigationBar from 'expo-navigation-bar';

export default function StudentScreen() {
    const router = useRouter();
    const [isLocked, setIsLocked] = useState(false);
    const [messages, setMessages] = useState<MeshPacket[]>([]);
    const [status, setStatus] = useState<'Idle' | 'Discovering...' | 'Connected' | 'No Devices'>('Idle');
    const appState = useRef(AppState.currentState);

    // QR Scanning
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(false);
    const [sessionKey, setSessionKey] = useState<string | null>(null);

    // Animations
    const borderPulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isLocked) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(borderPulse, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                    Animated.timing(borderPulse, {
                        toValue: 0,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        } else {
            borderPulse.stopAnimation();
            borderPulse.setValue(0);
        }
    }, [isLocked]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isLocked) {
                Alert.alert('Locked', 'Exam in progress. You cannot exit.');
                return true;
            }
            return false;
        });
        return () => backHandler.remove();
    }, [isLocked]);

    useEffect(() => {
        if (isLocked) {
            ScreenCapture.preventScreenCaptureAsync();
        } else {
            ScreenCapture.allowScreenCaptureAsync();
        }
    }, [isLocked]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/active/) &&
                nextAppState.match(/inactive|background/)
            ) {
                if (isLocked) {
                    console.warn('Student attempted to switch apps!');
                    StorageService.logViolation('APP_SWITCH', 'Student moved app to background');
                }
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, [isLocked]);

    useEffect(() => {
        const loadHistory = async () => {
            const savedMessages = await StorageService.getMessages();
            // Convert MessageLog[] to MeshPacket-like shape for display
            const packets: MeshPacket[] = savedMessages.map(msg => ({
                id: msg.id,
                senderRole: msg.senderRole,
                payload: msg.encryptedPayload,
                ttl: msg.ttl,
                timestamp: msg.receivedAt,
                signature: '',
            }));
            setMessages(packets);
        };
        loadHistory();

        const currentSession = authService.getSession();
        if (currentSession && currentSession.role === 'STUDENT') {
            setSessionKey(currentSession.key);
            startMeshClient();
        }
    }, []);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setIsScanning(false);
        try {
            const sessionData = JSON.parse(data);
            if (sessionData.key && sessionData.id) {
                authService.joinSession(sessionData.id, sessionData.key);
                setSessionKey(sessionData.key);
                Alert.alert('Joined Session', 'Encryption key received securely.');
                startMeshClient();
            } else {
                Alert.alert('Invalid QR', 'This is not a valid ExamCast QR code.');
            }
        } catch {
            Alert.alert('Error', 'Failed to parse QR code data.');
        }
    };

    const startScan = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert('Permission Needed', 'Camera permission is required to scan the exam QR code.');
                return;
            }
        }
        setIsScanning(true);
    };

    const startMeshClient = async () => {
        setStatus('Discovering...');
        const devices = await meshService.startDiscovery();
        if (devices.length > 0) {
            const connected = await meshService.connectToDevice(devices[0].address);
            setStatus(connected ? 'Connected' : 'No Devices');
        } else {
            setStatus('No Devices');
        }

        meshService.setMessageListener((packet: MeshPacket) => {
            setMessages(prev => [packet, ...prev]);
        });
    };

    const enterExamMode = async () => {
        if (!sessionKey) {
            Alert.alert('Join Session First', "Please scan the teacher's QR code before locking the exam.");
            return;
        }
        try {
            await LockTask.startLockTask();
            await NavigationBar.setVisibilityAsync("hidden");
            await NavigationBar.setBehaviorAsync("overlay-swipe");
            setIsLocked(true);
            Alert.alert('Exam Mode Active', 'Your device is now locked in exam mode.');
        } catch (e) {
            Alert.alert('Error', 'Could not start Kiosk mode. ' + e);
        }
    };

    const exitExamMode = async () => {
        try {
            await LockTask.stopLockTask();
            await NavigationBar.setVisibilityAsync("visible");
            setIsLocked(false);
            ScreenCapture.allowScreenCaptureAsync();
        } catch (e) {
            console.error('Failed to exit exam mode:', e);
        }
    };

    const renderMessage = (msg: MeshPacket) => {
        let content = msg.payload;
        let isDecrypted = false;
        if (sessionKey) {
            const decrypted = CryptoService.decrypt(msg.payload, sessionKey);
            if (decrypted) {
                content = decrypted;
                isDecrypted = true;
            }
        }

        return (
            <Card key={msg.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                    <Badge
                        label={msg.senderRole}
                        variant={msg.senderRole === 'TEACHER' ? 'info' : 'neutral'}
                        size="small"
                        showDot={false}
                    />
                    {isDecrypted && (
                        <Badge label="Decrypted" variant="success" size="small" showDot={false} />
                    )}
                </View>
                <Text style={styles.messageText}>{content}</Text>
                <Text style={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</Text>
            </Card>
        );
    };

    // ─── Status Badge ────────────────────────────────────────────────────────
    const statusVariant = status === 'Connected' ? 'success' : status === 'Discovering...' ? 'warning' : 'neutral';

    // ─── Animated border color ───────────────────────────────────────────────
    const animatedBorderColor = borderPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.success, Colors.successDark],
    });

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Student Exam Portal</Text>
                <Badge label={status} variant={statusVariant} />
            </View>

            {/* Status Card */}
            {isLocked ? (
                <Animated.View style={[styles.statusCardBorder, { borderColor: animatedBorderColor }]}>
                    <View style={styles.statusCardInner}>
                        <Lock size={28} color={Colors.success} />
                        <View style={styles.statusTextContainer}>
                            <Text style={styles.statusTitle}>Exam Mode Active</Text>
                            <Text style={styles.statusSubtitle}>Your device is securely locked</Text>
                        </View>
                        <Button title="Unlock (Dev)" onPress={exitExamMode} size="small" variant="outline" />
                    </View>
                </Animated.View>
            ) : (
                <GlowCard
                    glowColor={sessionKey ? 'primary' : 'accent'}
                    intensity="subtle"
                    style={styles.statusGlowCard}
                >
                    <View style={styles.statusCardInner}>
                        <Unlock size={28} color={Colors.warning} />
                        <View style={styles.statusTextContainer}>
                            <Text style={styles.statusTitle}>Exam Mode Inactive</Text>
                            <Text style={styles.statusSubtitle}>
                                {sessionKey ? 'Ready to lock — tap to begin' : 'Scan QR code to join session'}
                            </Text>
                        </View>
                        <Button
                            title={sessionKey ? "Lock" : "Scan QR"}
                            onPress={sessionKey ? enterExamMode : startScan}
                            size="small"
                            variant={sessionKey ? "primary" : "secondary"}
                            icon={!sessionKey ? <Scan size={14} color={Colors.text} /> : undefined}
                        />
                    </View>
                </GlowCard>
            )}

            {/* Feed */}
            <View style={styles.feedSection}>
                <SectionHeader
                    title="Exam Feed"
                    subtitle={`${messages.length} message${messages.length !== 1 ? 's' : ''}`}
                    icon={<Inbox size={18} color={Colors.primaryLight} />}
                />
                <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
                    {messages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Radio size={32} color={Colors.textMuted} />
                            <Text style={styles.emptyTitle}>No Messages Yet</Text>
                            <Text style={styles.emptyText}>Waiting for teacher instructions...</Text>
                        </View>
                    ) : (
                        messages.map(renderMessage)
                    )}
                </ScrollView>
            </View>

            {/* Camera Modal */}
            <Modal visible={isScanning} animationType="slide">
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        onBarcodeScanned={handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                    />
                    {/* Viewfinder Overlay */}
                    <View style={styles.cameraOverlay}>
                        <View style={styles.viewfinder}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        <Text style={styles.scanInstructions}>Point camera at exam QR code</Text>
                    </View>
                    <Button
                        title="Cancel"
                        onPress={() => setIsScanning(false)}
                        variant="outline"
                        style={styles.cancelButton}
                    />
                </View>
            </Modal>
        </ScreenWrapper>
    );
}

const VIEWFINDER_SIZE = 250;
const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;

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
    },
    statusCardBorder: {
        borderWidth: 1.5,
        borderRadius: BorderRadius.l,
        marginBottom: Spacing.l,
        backgroundColor: Colors.surface,
    },
    statusGlowCard: {
        marginBottom: Spacing.l,
    },
    statusCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        gap: Spacing.m,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusTitle: {
        fontSize: FontSizes.base,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    statusSubtitle: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    feedSection: {
        flex: 1,
    },
    feedContainer: {
        flex: 1,
    },
    messageCard: {
        marginBottom: Spacing.s,
    },
    messageHeader: {
        flexDirection: 'row',
        gap: Spacing.s,
        marginBottom: Spacing.xs,
    },
    messageText: {
        color: Colors.text,
        fontSize: FontSizes.base,
        marginBottom: Spacing.xs,
        lineHeight: 22,
    },
    timestamp: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        alignSelf: 'flex-end',
    },
    emptyState: {
        padding: Spacing.xxl,
        alignItems: 'center',
        gap: Spacing.s,
    },
    emptyTitle: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.semibold,
        color: Colors.textSecondary,
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: FontSizes.md,
    },
    // Camera
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewfinder: {
        width: VIEWFINDER_SIZE,
        height: VIEWFINDER_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER_WIDTH,
        borderLeftWidth: CORNER_WIDTH,
        borderColor: Colors.primary,
        borderTopLeftRadius: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER_WIDTH,
        borderRightWidth: CORNER_WIDTH,
        borderColor: Colors.primary,
        borderTopRightRadius: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER_WIDTH,
        borderLeftWidth: CORNER_WIDTH,
        borderColor: Colors.primary,
        borderBottomLeftRadius: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER_WIDTH,
        borderRightWidth: CORNER_WIDTH,
        borderColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    scanInstructions: {
        color: Colors.text,
        fontSize: FontSizes.base,
        fontWeight: FontWeights.medium,
        marginTop: Spacing.l,
        textAlign: 'center',
    },
    cancelButton: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
    },
});
