export interface Devices {
  devices: Device[];
}

export interface Device {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
  supports_volume: boolean;
}

export enum GetDevicesStatus {
  UseWebPlayer = "Failure",
  ChooseDevice = "ChooseDevice",
}

export type GetDevicesResponse =
  | { status: GetDevicesStatus.UseWebPlayer }
  | { status: GetDevicesStatus.ChooseDevice; data: Device[] };
