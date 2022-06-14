import { Tool } from "@prisma/client";
import type { useFetcher } from "@remix-run/react";
import type { DrawingSession } from "~/server/db.server";
import { ACTIONS } from "~/utils/constants";
import Clear from "./clear";

export default function Sidebar({
  fetcher,
  session,
}: {
  fetcher: ReturnType<typeof useFetcher>;
  session: DrawingSession;
}) {
  return (
    <aside className="bg-sky-100">
      <h5 className="text-lg">Pick your tool</h5>
      <nav>
        <ul className="p-0 m-0">
          <li className="mb-3 p-3 text-center">
            <Clear fetcher={fetcher} />
          </li>
          <li className="mb-3 p-3 text-center">
            <fetcher.Form
              method="post"
              className="flex items-center justify-center"
            >
              <input type="hidden" name="action" value={ACTIONS.PICK_TOOL} />
              <input type="hidden" name="tool" value={Tool.CIRCLE} />
              <button
                type="submit"
                disabled={session?.tool === Tool.CIRCLE}
                className="bg-sky-500 text-white bold flex-1 text-center rounded-md p-2 disabled:bg-sky-900 disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    r="10"
                    cy="12"
                    cx="12"
                  />
                </svg>
              </button>
            </fetcher.Form>
          </li>
          <li className="p-3 text-center">
            <fetcher.Form
              method="post"
              className="flex items-center justify-center"
            >
              <input type="hidden" name="action" value={ACTIONS.PICK_TOOL} />
              <input type="hidden" name="tool" value={Tool.SQUARE} />
              <button
                type="submit"
                disabled={session?.tool === Tool.SQUARE}
                className="bg-sky-500 text-white bold flex-1 text-center rounded-md p-2 disabled:bg-sky-900 disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-center mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <rect
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="20"
                    height="20"
                    y="1"
                    x="1"
                  />
                </svg>
              </button>
            </fetcher.Form>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
