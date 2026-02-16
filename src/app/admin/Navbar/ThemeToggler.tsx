import { IconChevronDown, IconSun } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

const ThemeToggler = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
  ].sort();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    applyTheme(storedTheme);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="btn btn-primary flex items-center gap-2"
      >
        <IconSun />
        <IconChevronDown />
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 menu bg-base-100 rounded-box z-50 w-52 p-2 h-80 overflow-y-auto shadow-2xl">
          <div>
            {themes.map((theme) => (
              <li key={theme}>
                <button
                  onClick={() => {
                    applyTheme(theme);
                    setOpen(false);
                  }}
                  className="btn btn-sm btn-ghost justify-start capitalize w-full"
                >
                  {theme}
                </button>
              </li>
            ))}
          </div>
        </ul>
      )}
    </div>
  );
};

export default ThemeToggler;
