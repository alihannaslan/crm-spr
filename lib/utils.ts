import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const fallback = `${response.status} ${response.statusText}`.trim()
  const hasText = text.length > 0

  let parsed: unknown = null

  if (hasText) {
    try {
      parsed = JSON.parse(text)
    } catch (error) {
      if (!response.ok) {
        throw new Error(text || fallback || "Request failed")
      }
      throw error
    }
  }

  if (!response.ok) {
    const errorMessage =
      (parsed && typeof (parsed as Record<string, unknown>).error === "string"
        ? ((parsed as Record<string, unknown>).error as string)
        : hasText
          ? text
          : fallback) || "Request failed"
    throw new Error(errorMessage)
  }

  return parsed as T
}
