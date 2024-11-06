import { Prisma } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { useEffect, useLayoutEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateInput(error: any) {
  // Convert ZodError into an object with field-specific error messages
  const errorMessages = error.errors.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: Record<string, string>, err: any) => {
      acc[err.path[0]] = err.message;
      return acc;
    },
    {}
  );

  return { success: false, errors: errorMessages };
}

export async function handleDelete<T>(deleteFn: () => T) {
  try {
    const deleted = await deleteFn();
    return deleted;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return error.message;
      }
    }
    throw error;
  }
}

export function isRunningOnServer() {
  return typeof window === "undefined";
}

export const useServerLayoutEffect = isRunningOnServer()
  ? useEffect
  : useLayoutEffect;

let hasHydrated = false;
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(hasHydrated);
  useEffect(() => {
    hasHydrated = true;
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
