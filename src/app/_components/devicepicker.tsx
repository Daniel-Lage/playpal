import type { Session } from "next-auth";
import type { Dispatch, SetStateAction } from "react";
import type { Device } from "~/lib/types";
import { getDevices } from "~/server/queries";

export default function DevicePicker({
  devices,
  setDevices,
  target,
  setTarget,
  session,
}: {
  devices: Device[];
  setDevices: Dispatch<SetStateAction<Device[]>>;
  target: Device | undefined;
  setTarget: Dispatch<SetStateAction<Device | undefined>>;
  session: Session;
}) {
  if (devices.length > 0 && target)
    return (
      <div className="flex flex-col items-center rounded-xl bg-lime-300 text-center">
        <div className="w-full rounded-t-lg bg-lime-600 p-1 font-bold">
          Pick spotify device
        </div>
        <select
          className="w-full cursor-pointer rounded-b-lg bg-lime-500 p-1"
          onChange={(e) => {
            const target = devices.find(
              (value) => value.name == e.target.value,
            );
            setTarget(target);
          }}
        >
          {devices.map((device) => (
            <option key={device.id}>{device.name}</option>
          ))}
        </select>
        <div className="flex gap-4">
          <button
            onClick={() => {
              getDevices(session.user.id)
                .then((devices) => {
                  setDevices(devices);
                  setTarget(devices[0]);
                })
                .catch(console.error);
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col items-center rounded-xl bg-lime-300 text-center">
      <div className="w-full rounded-t-lg bg-lime-600 p-1 font-bold">
        No active spotify device
      </div>
      <button
        onClick={() => {
          getDevices(session.user.id)
            .then((devices) => {
              setDevices(devices);
              setTarget(devices[0]);
            })
            .catch(console.error);
        }}
      >
        Reload
      </button>
    </div>
  );
}
