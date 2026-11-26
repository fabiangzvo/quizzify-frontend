import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { FaMoon, FaSun } from "react-icons/fa";

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted ? resolvedTheme === "light" : true;

  const handleToggle = useCallback(() => {
    setTheme(isLight ? "dark" : "light");
  }, [isLight, setTheme]);

  return (
    <Button
      isIconOnly
      size="sm"
      radius="full"
      variant="bordered"
      onPress={handleToggle}
      aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
      className="border-divider bg-content1 text-foreground hover:border-primary hover:text-primary"
    >
      {isLight ? (
        <FaSun aria-hidden="true" />
      ) : (
        <FaMoon aria-hidden="true" />
      )}
    </Button>
  );
}

export default ThemeButton;
