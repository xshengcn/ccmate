import { useCheckForUpdates, useInstallAndRestart } from "../lib/query";
import { RotateCwIcon, RefreshCcwIcon } from "lucide-react";
import { cn } from "../lib/utils";

export function UpdateButton() {
  const { data: updateInfo, isLoading, error } = useCheckForUpdates();
  const installAndRestart = useInstallAndRestart();

  if (isLoading || error) {
    return null;
  }

  if (!updateInfo || !updateInfo.available) {
    return null;
  }

  return (
    <div className="px-3 py-2">
      <div className="space-y-2">
        <button
          onClick={() => installAndRestart.mutate()}
          disabled={installAndRestart.isPending}
          className={cn("flex items-center justify-center text-sm gap-2  bg-zinc-100 hover:bg-zinc-200 rounded-md px-2 py-2 w-full",
            {
              "opacity-50": installAndRestart.isPending,
            }
          )}
        >
          {installAndRestart.isPending ? (
            <>
              <RotateCwIcon className="mr-2 h-4 w-4 animate-spin" />
              安装中...
            </>
          ) : (
            <>
              <RefreshCcwIcon className="h-4 w-4" />
              有新版本可更新
            </>
          )}
        </button>
      </div>
    </div>
  );
}