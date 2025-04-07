
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          variant="outline"
          size="sm"
          pressed={theme === "dark"}
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="rounded-full w-9 h-9 border-slate-200 dark:border-slate-700"
        >
          {theme === "light" ? (
            <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          )}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>
        <p>Toggle {theme === "light" ? "dark" : "light"} mode</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeToggle;
