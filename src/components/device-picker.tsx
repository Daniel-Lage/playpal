"use client";

import { BoomBox, Computer, Smartphone } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { Device } from "~/models/device.model";

export function DevicePicker({
  pickDevice,
  devices,
}: {
  pickDevice: (device: Device) => void;
  devices?: Device[];
}) {
  return (
    <Dialog open={!!devices}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pick Device To Play On</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-2 space-x-2">
          {devices?.map((value) => (
            <Button
              key={value.id}
              size="select"
              onClick={() => pickDevice(value)}
            >
              {value.name}
              <DeviceIcon type={value.type} />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeviceIcon({ type }: { type: string }) {
  if (type === "Smartphone") return <Smartphone />;
  if (type === "Computer") return <Computer />;
  return <BoomBox />;
}
