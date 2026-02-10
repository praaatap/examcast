import { BorderRadius, Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    showDot?: boolean;
    size?: 'small' | 'medium';
    style?: StyleProp<ViewStyle>;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: Colors.success, dot: Colors.success },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: Colors.warning, dot: Colors.warning },
    danger: { bg: 'rgba(239, 68, 68, 0.15)', text: Colors.danger, dot: Colors.danger },
    info: { bg: 'rgba(59, 130, 246, 0.15)', text: Colors.info, dot: Colors.info },
    neutral: { bg: Colors.surfaceLight, text: Colors.textSecondary, dot: Colors.textSecondary },
};

export const Badge: React.FC<BadgeProps> = ({
    label,
    variant = 'neutral',
    showDot = true,
    size = 'small',
    style,
}) => {
    const colors = variantColors[variant];
    const isSmall = size === 'small';

    return (
        <View style={[
            styles.container,
            { backgroundColor: colors.bg },
            isSmall ? styles.small : styles.medium,
            style,
        ]}>
            {showDot && (
                <View style={[styles.dot, { backgroundColor: colors.dot }]} />
            )}
            <Text style={[
                styles.label,
                { color: colors.text },
                isSmall ? styles.smallText : styles.mediumText,
            ]}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.full,
    },
    small: {
        paddingHorizontal: Spacing.s,
        paddingVertical: 3,
        gap: 4,
    },
    medium: {
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.xs,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    label: {
        fontWeight: FontWeights.semibold,
    },
    smallText: {
        fontSize: FontSizes.xs,
    },
    mediumText: {
        fontSize: FontSizes.sm,
    },
});
