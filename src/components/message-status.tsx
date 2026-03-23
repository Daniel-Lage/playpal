import { ActionStatus } from "~/models/status.model";
import { PopupType, PopupView } from "./popup-view";
import { Check, X } from "lucide-react";

export function StatusMessage({
  status,
  actionDone,
}: {
  status: ActionStatus;
  actionDone: string;
}) {
  if (status === ActionStatus.Success)
    return (
      <PopupView type={PopupType.Success}>
        <Check size={40} />
        {actionDone} Sucessfully
      </PopupView>
    );

  if (status === ActionStatus.Failure)
    return (
      <PopupView type={PopupType.ServerError}>
        <X size={40} />
        Internal Server Error
      </PopupView>
    );

  return null;
}
