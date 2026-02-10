declare module 'react-native-lock-task' {
    export function startLockTask(): Promise<void>;
    export function stopLockTask(): Promise<void>;
    export function unlock(): Promise<void>;
}

declare module 'react-native-bluetooth-classic' {
    import { EmitterSubscription } from 'react-native';

    export interface BluetoothDevice {
        name: string;
        address: string;
        id: string;
        class: number;
        rssi: number;
        extra: any;
        connect(options?: any): Promise<boolean>;
        disconnect(): Promise<boolean>;
        isConnected(): Promise<boolean>;
        write(data: string | number[] | Buffer, encoding?: string): Promise<boolean>;
        read(): Promise<string>;
        onDataReceived(listener: (event: { device: BluetoothDevice, data: string, timestamp: string, type: string }) => void): EmitterSubscription;
    }

    export interface BluetoothClassicType {
        startDiscovery(): Promise<BluetoothDevice[]>;
        cancelDiscovery(): Promise<boolean>;
        connectToDevice(address: string, options?: any): Promise<BluetoothDevice>;
        getConnectedDevices(): Promise<BluetoothDevice[]>;
        accept(options?: { delimiter?: string }): Promise<BluetoothDevice>;
        cancelAccept(): Promise<boolean>;
        requestEnable(): Promise<boolean>;
        enable(): Promise<boolean>;
        disable(): Promise<boolean>;
        onDeviceDisconnected(listener: (event: { device: BluetoothDevice }) => void): EmitterSubscription;
    }

    const BluetoothClassic: BluetoothClassicType;
    export default BluetoothClassic;
}
