import { ThemeToggle } from "@/components/theme-toggle";

export const Footer = () => {
  return (
    <footer className="mt-6 px-4 py-6">
      <div className="container flex items-center p-0">
        <p className="text-sm">
          Copyright 2024 Ira Project
        </p>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};
