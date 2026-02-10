import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Colors, FontSizes, FontWeights, Gradients, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { GraduationCap, Lock, Projector, Radio, WifiOff } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
    const router = useRouter();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulse animation for logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Fade in content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            delay: 200,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <ScreenWrapper>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <LinearGradient
                        colors={[...Gradients.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoGradient}
                    >
                        <GraduationCap size={48} color={Colors.text} />
                    </LinearGradient>
                </Animated.View>

                <Text style={styles.title}>ExamCast</Text>
                <Text style={styles.subtitle}>Secure Offline Exam Environment</Text>

                {/* Feature Chips */}
                <View style={styles.chipRow}>
                    <View style={styles.chip}>
                        <Lock size={10} color={Colors.primaryLight} />
                        <Text style={styles.chipText}>Encrypted</Text>
                    </View>
                    <View style={styles.chip}>
                        <Radio size={10} color={Colors.secondary} />
                        <Text style={styles.chipText}>Mesh Network</Text>
                    </View>
                    <View style={styles.chip}>
                        <WifiOff size={10} color={Colors.warning} />
                        <Text style={styles.chipText}>Offline</Text>
                    </View>
                </View>
            </View>

            {/* ─── Role Selection ─── */}
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <Text style={styles.sectionTitle}>Choose Your Role</Text>

                <GlowCard glowColor="accent" intensity="strong" style={styles.roleCard}>
                    <View style={styles.roleIconRow}>
                        <View style={[styles.roleIconBg, { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}>
                            <Projector size={28} color={Colors.primaryLight} />
                        </View>
                        <View style={styles.roleTextContainer}>
                            <Text style={styles.roleTitle}>Teacher</Text>
                            <Text style={styles.roleDesc}>Create exams, broadcast questions, monitor students</Text>
                        </View>
                    </View>
                    <Button
                        title="Start as Teacher"
                        onPress={() => router.push('/teacher')}
                        variant="primary"
                        size="medium"
                        icon={<Projector size={18} color={Colors.text} />}
                    />
                </GlowCard>

                <GlowCard glowColor="secondary" intensity="strong" style={styles.roleCard}>
                    <View style={styles.roleIconRow}>
                        <View style={[styles.roleIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <GraduationCap size={28} color={Colors.secondaryLight} />
                        </View>
                        <View style={styles.roleTextContainer}>
                            <Text style={styles.roleTitle}>Student</Text>
                            <Text style={styles.roleDesc}>Join exams, receive questions, secure lockdown mode</Text>
                        </View>
                    </View>
                    <Button
                        title="Join as Student"
                        onPress={() => router.push('/student')}
                        variant="secondary"
                        size="medium"
                        icon={<GraduationCap size={18} color={Colors.text} />}
                    />
                </GlowCard>
            </Animated.View>

            {/* ─── Footer ─── */}
            <View style={styles.footer}>
                <View style={styles.footerLine} />
                <Text style={styles.footerText}>No Internet Required • End-to-End Encrypted</Text>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginTop: Spacing.xl,
        marginBottom: Spacing.l,
    },
    logoContainer: {
        marginBottom: Spacing.m,
    },
    logoGradient: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: FontSizes['4xl'],
        fontWeight: FontWeights.extrabold,
        color: Colors.text,
        letterSpacing: 1.5,
    },
    subtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    chipRow: {
        flexDirection: 'row',
        gap: Spacing.s,
        marginTop: Spacing.m,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.s,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: Colors.surfaceLight,
    },
    chipText: {
        fontSize: FontSizes.xs,
        color: Colors.textSecondary,
        fontWeight: FontWeights.medium,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: Spacing.m,
        paddingHorizontal: Spacing.s,
    },
    sectionTitle: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    roleCard: {
        // GlowCard already has padding
    },
    roleIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
        marginBottom: Spacing.m,
    },
    roleIconBg: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleTextContainer: {
        flex: 1,
    },
    roleTitle: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
        color: Colors.text,
    },
    roleDesc: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        marginBottom: Spacing.l,
        gap: Spacing.s,
    },
    footerLine: {
        width: 60,
        height: 2,
        borderRadius: 1,
        backgroundColor: Colors.surfaceLight,
    },
    footerText: {
        color: Colors.textMuted,
        fontSize: FontSizes.xs,
        letterSpacing: 0.5,
    },
});
