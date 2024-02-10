import { useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { FaMoon, FaSun } from "react-icons/fa";

import Button from "@components/button";

function ThemeButton() {
  const { theme, setTheme } = useTheme();

  const handleClick = useCallback<React.MouseEventHandler<HTMLElement>>(
    () => setTheme(theme === "light" ? "dark" : "light"),
    [theme, setTheme]
  );

  const component = useMemo(
    () => (theme === "light" ? <FaSun /> : <FaMoon />),
    [theme]
  );

  return (
    <Button
      classes="rounded-full flex justify-center items-center py-0 h-8 w-8 border-paragraph hover:text-white hover:border-primary"
      handleClick={handleClick}
      label={component}
      overrideClass
    />
  );
}

export default ThemeButton;
