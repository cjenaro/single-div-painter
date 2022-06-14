import type { useFetcher } from "@remix-run/react";
import { ACTIONS } from "~/utils/constants";

export default function Clear({
  fetcher,
}: {
  fetcher: ReturnType<typeof useFetcher>;
}) {
  return (
    <fetcher.Form method="post" className="flex items-center justify-center">
      <input type="hidden" name="action" value={ACTIONS.CLEAR_SESSION} />
      <button
        className="uppercase bg-sky-500 text-white bold flex-1 text-center rounded-md p-2"
        type="submit"
      >
        Clear
      </button>
    </fetcher.Form>
  );
}
