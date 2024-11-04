import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import classNames from "classnames";

import styles from "./tailwind.css?url";

import { AiOutlineHome } from "react-icons/ai";
import { CiImageOn } from "react-icons/ci";
import { IoBookOutline, IoSettingsOutline } from "react-icons/io5";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "stylesheet", href: styles },

  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex max-md:flex-col h-screen">
        {children}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <nav className="bg-blue-600 text-white">
        <ul className="flex  justify-around items-center md:flex-col">
          <AppNavLink to="/">
            <AiOutlineHome />
          </AppNavLink>
          <AppNavLink to="discover">
            <CiImageOn />
          </AppNavLink>
          <AppNavLink to="app/pantry">
            <IoBookOutline />
          </AppNavLink>
          <AppNavLink to="settings">
            <IoSettingsOutline />
          </AppNavLink>
        </ul>
      </nav>
      <div className="p-4 w-full">
        {" "}
        <Outlet />
      </div>
    </>
  );
}

function AppNavLink({
  children,
  to,
}: {
  children: React.ReactNode;
  to: string;
}) {
  return (
    <li>
      <NavLink to={to}>
        {({ isActive }) => (
          <div
            className={classNames(
              "p-4 w-full text-3xl flex justify-center hover:bg-blue-400",
              {
                "bg-blue-400": isActive,
              }
            )}
          >
            {children}
          </div>
        )}
      </NavLink>
    </li>
  );
}
