import { Outlet } from "@remix-run/react";

export default function AuthLayout() {
  return (
    <div className="w-screen flex justify-center items-center h-screen  bg-red-500">
      <Outlet />
    </div>
  );
}
