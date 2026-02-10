const { withAndroidManifest } = require('@expo/config-plugins');

const withKioskMode = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const mainApplication = androidManifest.manifest.application[0];
        const mainActivity = mainApplication.activity[0];

        // Add permissions
        if (!androidManifest.manifest['uses-permission']) {
            androidManifest.manifest['uses-permission'] = [];
        }
        const permissions = [
            'android.permission.MANAGE_DEVICE_ADMINS', // Detailed admin
            'android.permission.REORDER_TASKS',        // For bringing app to front
        ];

        permissions.forEach(permission => {
            if (!androidManifest.manifest['uses-permission'].some(p => p.$['android:name'] === permission)) {
                androidManifest.manifest['uses-permission'].push({
                    $: { 'android:name': permission }
                });
            }
        });

        // Add lockTaskMode to activity if supported (usually programmatic, but category HOME helps)
        // We add category HOME to be a launcher if the user wants
        // But for now, we just ensure standard setup

        return config;
    });
};

module.exports = withKioskMode;
