import type { Tool } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";

const COOKIE_KEY = "cooks";

const session = createCookieSessionStorage({
  cookie: {
    name: "DRAW_session",
    secure: process.env.NODE_ENV === "production",
    secrets: ["sessionSecret"],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getSession(request: Request) {
  return session.getSession(request.headers.get("Cookie"));
}

export async function getDrawingSession(
  request: Request
): Promise<DrawingSession> {
  return (await getSession(request)).get(COOKIE_KEY);
}

export type DrawingSession = {
  tool: Tool;
  selectedShape?: number;
};

export async function createDrawingSession(
  request: Request,
  drawingSession: DrawingSession,
  redirectTo = request.url
) {
  const sesh = await getSession(request);
  sesh.set(COOKIE_KEY, drawingSession);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await session.commitSession(sesh),
    },
  });
}
