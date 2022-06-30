import { Tool } from "@prisma/client";
import type { useFetcher } from "@remix-run/react";
import type { DrawingSession } from "~/server/db.server";
import { ACTIONS, APP_TOOLS } from "~/utils/constants";
import Clear from "./clear";

export default function Sidebar({
  fetcher,
  session,
}: {
  fetcher: ReturnType<typeof useFetcher>;
  session: DrawingSession;
}) {
  return (
    <aside className="bg-sky-100 relative z-10">
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
                disabled={session?.hasJS && session?.tool === Tool.CIRCLE}
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
                disabled={session?.hasJS && session?.tool === Tool.SQUARE}
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
          <li className="p-3 text-center">
            <fetcher.Form
              method="post"
              className="flex items-center justify-center"
            >
              <input type="hidden" name="action" value={ACTIONS.PICK_TOOL} />
              <input type="hidden" name="tool" value={APP_TOOLS.SELECT} />
              <button
                type="submit"
                disabled={session?.tool === APP_TOOLS.SELECT}
                className="bg-sky-500 text-white bold flex-1 text-center rounded-md p-2 disabled:bg-sky-900 disabled:opacity-40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
                    clipRule="evenodd"
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
