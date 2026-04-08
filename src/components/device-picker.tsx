"use client";

import { BoomBox, Computer, Smartphone, X } from "lucide-react";

import type { Device } from "~/models/device.model";
import { MenuButton } from "./buttons/menu-button";
import { OneElementView } from "./one-element-view";
import { IconButton } from "./buttons/icon-button";

export function DevicePicker({
  pickDevice,
  close,
  devices,
}: {
  pickDevice: (deviceId: string) => void;
  close: () => void;
  devices: Device[];
}) {
  return (
    <div className="fixed z-10 flex h-full w-svw items-center justify-center backdrop-brightness-50 md:ml-[--nav-bar-w] md:w-[--main-view-w]">
      <OneElementView>
        <div className="flex w-full justify-between">
          <h1 className="p-2 text-xl font-bold">Pick Device To Play On</h1>
          <IconButton onClick={close}>
            <X />
          </IconButton>
        </div>
        {devices?.map((value) => (
          <MenuButton key={value.id} onClick={() => pickDevice(value.id)}>
            {value.name}
            <DeviceIcon type={value.type} />
          </MenuButton>
        ))}
      </OneElementView>
    </div>
  );
}

function DeviceIcon({ type }: { type: string }) {
  if (type === "Smartphone") return <Smartphone />;
  if (type === "Computer") return <Computer />;
  return <BoomBox />;
}
