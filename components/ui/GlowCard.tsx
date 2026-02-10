import { BorderRadius, Colors, Gradients, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface GlowCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    glowColor?: 'primary' | 'secondary' | 'accent' | 'danger';
    intensity?: 'subtle' | 'strong';
}

const glowGradients: Record<string, readonly [string, string]> = {
    primary: ['rgba(37, 99, 235, 0.6)', 'rgba(37, 99, 235, 0.1)'],
    secondary: ['rgba(16, 185, 129, 0.6)', 'rgba(16, 185, 129, 0.1)'],
    accent: ['rgba(99, 102, 241, 0.6)', 'rgba(37, 99, 235, 0.1)'],
    danger: ['rgba(239, 68, 68, 0.6)', 'rgba(239, 68, 68, 0.1)'],
};

export const GlowCard: React.FC<GlowCardProps> = ({
    children,
    style,
    glowColor = 'primary',
    intensity = 'subtle',
}) => {
    const borderWidth = intensity === 'strong' ? 1.5 : 1;
    const gradientColors = glowGradients[glowColor] ?? Gradients.primary;

    return (
        <LinearGradient
            colors={[gradientColors[0], gradientColors[1], 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientBorder, { padding: borderWidth }, style]}
        >
            <View style={styles.innerCard}>
                {children}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientBorder: {
        borderRadius: BorderRadius.l,
        overflow: 'hidden',
    },
    innerCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.l - 1,
        padding: Spacing.m,
    },
});
