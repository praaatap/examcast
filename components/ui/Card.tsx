import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated' }) => {
    return (
        <View
            style={[
                styles.container,
                variant === 'elevated' && styles.elevated,
                variant === 'outlined' && styles.outlined,
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.l,
        padding: Spacing.m,
    },
    elevated: {
        ...Shadows.medium,
    },
    outlined: {
        borderWidth: 1,
        borderColor: Colors.surfaceLight,
        backgroundColor: 'transparent',
    },
});
