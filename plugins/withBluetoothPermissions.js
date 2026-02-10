const { withAndroidManifest } = require('@expo/config-plugins');

const withBluetoothPermissions = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;

        if (!androidManifest.manifest['uses-permission']) {
            androidManifest.manifest['uses-permission'] = [];
        }

        const permissions = [
            'android.permission.BLUETOOTH',
            'android.permission.BLUETOOTH_ADMIN',
            'android.permission.BLUETOOTH_CONNECT',
            'android.permission.BLUETOOTH_SCAN',
            'android.permission.BLUETOOTH_ADVERTISE',
            'android.permission.ACCESS_FINE_LOCATION',
            'android.permission.ACCESS_COARSE_LOCATION'
        ];

        permissions.forEach(permission => {
            if (!androidManifest.manifest['uses-permission'].some(p => p.$['android:name'] === permission)) {
                androidManifest.manifest['uses-permission'].push({
                    $: { 'android:name': permission }
                });
            }
        });

        // Add uses-feature for bluetooth
        if (!androidManifest.manifest['uses-feature']) {
            androidManifest.manifest['uses-feature'] = [];
        }

        if (!androidManifest.manifest['uses-feature'].some(f => f.$['android:name'] === 'android.hardware.bluetooth')) {
            androidManifest.manifest['uses-feature'].push({
                $: { 'android:name': 'android.hardware.bluetooth', 'android:required': 'true' }
            });
        }

        return config;
    });
};

module.exports = withBluetoothPermissions;
