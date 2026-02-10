import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { CryptoService } from './crypto';
import { StorageService } from './storage';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MeshPacket {
    id: string;
    senderRole: 'TEACHER' | 'STUDENT';
    payload: string; // Encrypted
    ttl: number;
    timestamp: number;
    signature: string;
}

type ConnectionChangeCallback = (count: number) => void;
type MessageCallback = (packet: MeshPacket) => void;

// ─── Service ─────────────────────────────────────────────────────────────────

class MeshService {
    private connectedDevices: Map<string, BluetoothDevice> = new Map();
    private isServer: boolean = false;
    private isAccepting: boolean = false;
    private onMessageReceivedCallback: MessageCallback | null = null;
    private onConnectionChangeCallback: ConnectionChangeCallback | null = null;
    private processedMessageIds: Set<string> = new Set();
    private sessionKey: string | null = null;

    constructor() {
        this.init();
    }

    // ─── Initialization ──────────────────────────────────────────────────

    private async init() {
        if (Platform.OS === 'android') {
            await this.requestPermissions();
        }
    }

    private async requestPermissions(): Promise<boolean> {
        const results = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return Object.values(results).every(
            result => result === PermissionsAndroid.RESULTS.GRANTED
        );
    }

    // ─── Session Key ─────────────────────────────────────────────────────

    setSessionKey(key: string) {
        this.sessionKey = key;
    }

    // ─── Discovery & Connection ──────────────────────────────────────────

    async startDiscovery(): Promise<BluetoothDevice[]> {
        try {
            const devices = await RNBluetoothClassic.startDiscovery();
            return devices;
        } catch (error) {
            console.error('[MeshService] Discovery failed:', error);
            return [];
        }
    }

    async connectToDevice(address: string): Promise<boolean> {
        try {
            const device = await RNBluetoothClassic.connectToDevice(address);
            if (device) {
                this.connectedDevices.set(address, device);
                this.setupDeviceListener(device);
                this.notifyConnectionChange();
                return true;
            }
            return false;
        } catch (error) {
            console.error('[MeshService] Connection failed:', error);
            return false;
        }
    }

    // ─── Server Mode (Teacher / Relay) ───────────────────────────────────

    async startServer(): Promise<void> {
        this.isServer = true;
        this.isAccepting = true;
        this.acceptLoop();
    }

    private async acceptLoop(): Promise<void> {
        while (this.isAccepting) {
            try {
                const device = await RNBluetoothClassic.accept({ delimiter: '\n' });
                if (device) {
                    console.log('[MeshService] Accepted connection from', device.name);
                    this.connectedDevices.set(device.address, device);
                    this.setupDeviceListener(device);
                    this.notifyConnectionChange();
                }
            } catch (error) {
                if (this.isAccepting) {
                    console.error('[MeshService] Server accept failed:', error);
                    // Brief delay before retrying to avoid tight error loops
                    await this.delay(1000);
                }
            }
        }
    }

    // ─── Messaging ───────────────────────────────────────────────────────

    private setupDeviceListener(device: BluetoothDevice): void {
        device.onDataReceived((data) => {
            const message = data.data;
            this.handleIncomingData(message);
        });
    }

    async broadcast(packet: MeshPacket): Promise<void> {
        const data = JSON.stringify(packet) + '\n';
        const deadAddresses: string[] = [];

        // Collect failed devices and remove after iteration
        const promises = Array.from(this.connectedDevices.entries()).map(
            async ([address, device]) => {
                try {
                    await device.write(data);
                } catch (error) {
                    console.error(`[MeshService] Failed to send to ${address}:`, error);
                    deadAddresses.push(address);
                }
            }
        );

        await Promise.allSettled(promises);

        // Cleanup dead connections
        if (deadAddresses.length > 0) {
            deadAddresses.forEach(addr => this.connectedDevices.delete(addr));
            this.notifyConnectionChange();
        }
    }

    private async handleIncomingData(data: string): Promise<void> {
        try {
            const packet: MeshPacket = JSON.parse(data.trim());

            // 1. Deduplication — skip already processed messages
            if (this.processedMessageIds.has(packet.id)) return;
            this.processedMessageIds.add(packet.id);

            // 2. TTL Check — don't process expired packets
            if (packet.ttl <= 0) return;

            // 3. Signature Verification
            if (this.sessionKey && packet.signature) {
                const isValid = CryptoService.verify(
                    packet.payload,
                    packet.signature,
                    this.sessionKey
                );
                if (!isValid) {
                    console.warn('[MeshService] Invalid signature, dropping packet:', packet.id);
                    return;
                }
            }

            // 4. Persist to local storage
            await StorageService.saveMessage({
                id: packet.id,
                senderRole: packet.senderRole,
                encryptedPayload: packet.payload,
                receivedAt: Date.now(),
                ttl: packet.ttl,
            });

            // 5. Notify UI listener
            if (this.onMessageReceivedCallback) {
                this.onMessageReceivedCallback(packet);
            }

            // 6. Relay with decremented TTL
            const relayedPacket: MeshPacket = { ...packet, ttl: packet.ttl - 1 };
            await this.broadcast(relayedPacket);

        } catch (error) {
            console.error('[MeshService] Failed to parse incoming packet:', error);
        }
    }

    // ─── Listeners ───────────────────────────────────────────────────────

    setMessageListener(callback: MessageCallback): void {
        this.onMessageReceivedCallback = callback;
    }

    setConnectionChangeListener(callback: ConnectionChangeCallback): void {
        this.onConnectionChangeCallback = callback;
    }

    private notifyConnectionChange(): void {
        if (this.onConnectionChangeCallback) {
            this.onConnectionChangeCallback(this.getConnectedCount());
        }
    }

    // ─── State Getters ───────────────────────────────────────────────────

    getConnectedCount(): number {
        return this.connectedDevices.size;
    }

    getIsServer(): boolean {
        return this.isServer;
    }

    // ─── Cleanup ─────────────────────────────────────────────────────────

    async destroy(): Promise<void> {
        this.isAccepting = false;
        this.isServer = false;
        this.onMessageReceivedCallback = null;
        this.onConnectionChangeCallback = null;
        this.sessionKey = null;

        // Disconnect all devices
        const disconnectPromises = Array.from(this.connectedDevices.entries()).map(
            async ([address, device]) => {
                try {
                    await device.disconnect();
                } catch (error) {
                    console.error(`[MeshService] Failed to disconnect ${address}:`, error);
                }
            }
        );

        await Promise.allSettled(disconnectPromises);
        this.connectedDevices.clear();
        this.processedMessageIds.clear();
    }

    // ─── Utils ───────────────────────────────────────────────────────────

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const meshService = new MeshService();
