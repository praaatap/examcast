import { BorderRadius, Colors, FontWeights, Gradients, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleProp,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    ViewStyle,
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'small' | 'medium' | 'large';
    isLoading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const sizeConfig = {
    small: { height: 36, fontSize: 14, paddingH: Spacing.m },
    medium: { height: 48, fontSize: 16, paddingH: Spacing.l },
    large: { height: 56, fontSize: 18, paddingH: Spacing.xl },
};

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    disabled = false,
    icon,
    style,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const config = sizeConfig[size];
    const isOutline = variant === 'outline';

    const textColor = (() => {
        if (disabled) return Colors.textSecondary;
        if (isOutline) return Colors.primary;
        return Colors.text;
    })();

    const backgroundColor = (() => {
        if (disabled) return Colors.surfaceLight;
        if (isOutline) return 'transparent';
        if (variant === 'danger') return Colors.danger;
        if (variant === 'secondary') return Colors.secondary;
        return Colors.primary;
    })();

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    // Shared inner content
    const innerContent = (
        <>
            {isLoading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <>
                    {icon}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: textColor,
                                fontSize: config.fontSize,
                                marginLeft: icon ? Spacing.s : 0,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </>
    );

    const containerStyle: ViewStyle = {
        height: config.height,
        paddingHorizontal: config.paddingH,
        backgroundColor: variant === 'primary' && !disabled ? 'transparent' : backgroundColor,
        borderWidth: isOutline ? 2 : 0,
        borderColor: isOutline ? Colors.primary : 'transparent',
    };

    // Primary variant gets gradient wrapper
    if (variant === 'primary' && !disabled) {
        return (
            <TouchableWithoutFeedback
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || isLoading}
            >
                <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
                    <LinearGradient
                        colors={[...Gradients.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradient]}
                    >
                        <Animated.View style={[styles.container, containerStyle]}>
                            {innerContent}
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || isLoading}
        >
            <Animated.View
                style={[
                    styles.container,
                    containerStyle,
                    { transform: [{ scale: scaleAnim }] },
                    style,
                ]}
            >
                {innerContent}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.m,
    },
    gradient: {
        borderRadius: BorderRadius.m,
        overflow: 'hidden',
    },
    text: {
        fontWeight: FontWeights.semibold,
        letterSpacing: 0.5,
    },
});
