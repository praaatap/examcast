import { Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    safeArea?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    safeArea = true
}) => {
    const Container = safeArea ? SafeAreaView : View;

    return (
        <Container style={[styles.container, style]}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            <View style={styles.content}>
                {children}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: Spacing.m,
    },
});
