import { RotateCw } from "lucide-react";
import { FormButton } from "~/components/buttons/form-button";
import { OneElementView } from "~/components/one-element-view";

export function ErrorPage() {
  return (
    <OneElementView>
      <form>
        <h1 className="p-2 text-xl font-bold">An error has occurred</h1>

        <FormButton>
          <RotateCw />
          <div className="text-lg font-bold">Reload Page</div>
        </FormButton>
      </form>
    </OneElementView>
  );
}
