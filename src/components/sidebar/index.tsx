import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Button, Link, Tooltip } from "@heroui/react";
import {
  LuHome,
  LuFileText,
  LuCompass,
  LuBarChart3,
  LuUsers,
  LuLogOut,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu";

import Brain from "@components/icons/lightBrain";

const NAV_ITEMS = [
  { label: "Inicio", icon: LuHome, href: "/" },
  { label: "Mis cuestionarios", icon: LuFileText, href: "/test/create" },
  { label: "Explorar", icon: LuCompass, href: "#" },
  { label: "Resultados", icon: LuBarChart3, href: "#" },
  { label: "Grupos", icon: LuUsers, href: "#" },
];

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 border-r border-divider bg-content1 py-5 transition-all duration-200 ${
        isCollapsed ? "w-[74px] px-2.5" : "w-56 px-4"
      }`}>
      {/* Logo + collapse toggle */}
      <div
        className={`flex items-center mb-8 ${
          isCollapsed ? "flex-col gap-3" : "justify-between px-1"
        }`}>
        <Link
          as={NextLink}
          href="/"
          className="flex items-center gap-2 min-w-0">
          <Brain width={26} height={26} className="fill-primary shrink-0" />
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight text-foreground truncate">
              Quizzify
            </span>
          )}
        </Link>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          radius="lg"
          onPress={() => setIsCollapsed((prev) => !prev)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          className="text-default-500 hover:text-foreground shrink-0">
          {isCollapsed ? (
            <LuPanelLeftOpen size={18} />
          ) : (
            <LuPanelLeftClose size={18} />
          )}
        </Button>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? router.pathname === "/"
              : item.href !== "#" && router.pathname.startsWith(item.href);

          const linkContent = (
            <Link
              key={item.label}
              as={NextLink}
              href={item.href}
              aria-label={item.label}
              className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
                isCollapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-primary text-white"
                  : "text-default-600 hover:bg-content2 hover:text-foreground"
              }`}>
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );

          return isCollapsed ? (
            <Tooltip key={item.label} content={item.label} placement="right">
              {linkContent}
            </Tooltip>
          ) : (
            linkContent
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-6">
        {isCollapsed ? (
          <Tooltip content="Cerrar sesión" placement="right">
            <Button
              isIconOnly
              variant="light"
              onPress={onLogout}
              aria-label="Cerrar sesión"
              className="w-full text-default-500 hover:text-danger">
              <LuLogOut size={18} />
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="light"
            startContent={<LuLogOut size={16} />}
            onPress={onLogout}
            className="w-full justify-start text-default-500 hover:text-danger">
            Cerrar sesión
          </Button>
        )}
      </div>
    </aside>
  );
}
