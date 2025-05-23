import { env } from "@/env";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return new URL(path, env.NEXT_PUBLIC_APP_URL).href
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
}

export function formatDateShort(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
}

/**
 * Scrolls to the element with the specified ID, using the window's hash
 * @param hash The ID of the element to scroll to (without the # symbol)
 * @param options Options for scrolling
 */
export function scrollToHashElement(hash: string, options?: { 
  behavior?: ScrollBehavior; 
  delay?: number;
  callback?: () => void;
  offset?: number;
}) {
  if (!hash) return;
  
  const delay = options?.delay ?? 300;
  const behavior = options?.behavior ?? 'smooth';
  const offset = options?.offset ?? 0;
  
  setTimeout(() => {
    const element = document.getElementById(hash);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior,
      });
      
      options?.callback?.();
    }
  }, delay);
}

/**
 * Sets up a listener for hash changes and scrolls to the element
 * when the hash changes or on initial load
 * @param dependencies Array of dependencies to re-run the effect when they change
 * @param offset Optional vertical offset in pixels from the element
 * @returns A cleanup function to remove the event listener
 */
export function useHashNavigation(dependencies: React.DependencyList = [], offset = 0) {
  const handleHashScroll = () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToHashElement(hash, { offset });
    }
  };

  // Run on initial load
  handleHashScroll();

  // Listen for hash changes
  window.addEventListener('hashchange', handleHashScroll);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('hashchange', handleHashScroll);
  };
}

/**
 * Gets the initials from a user's name (first letter of first and last name)
 * @param name The user's name
 * @returns The user's initials (1-2 characters)
 */
export function getUserInitials(name: string): string {
  if (!name || typeof name !== 'string') return "U";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  
  const first = parts[0]?.charAt(0)?.toUpperCase() ?? 'U';
  
  if (parts.length === 1) return first;
  
  const last = parts[parts.length - 1]?.charAt(0)?.toUpperCase() ?? '';
  return first + last;
}