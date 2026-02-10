import { Colors, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    right?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    icon,
    right,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.left}>
                {icon && <View style={styles.iconWrapper}>{icon}</View>}
                <View>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            </View>
            {right && <View>{right}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.m,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    iconWrapper: {
        opacity: 0.8,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.semibold,
        color: Colors.text,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});
