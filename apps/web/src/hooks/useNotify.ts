"use client";

import { toast } from "sonner";

export function useNotify() {
  return {
    showSuccess: (message: string) => toast.success(message),
    showError: (message: string) => toast.error(message),
    showWarning: (message: string) => toast.warning(message),
    showInfo: (message: string) => toast.info(message),
  };
}
