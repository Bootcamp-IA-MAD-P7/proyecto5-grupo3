// @path: frontend/src/churn/components/navbar.tsx
import {
  ActivityIcon,
  HeadphonesIcon,
  LineChartIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import {
  NavigationMenuItem,
  NavigationMenuLink,
} from '@radix-ui/react-navigation-menu';

import type { Role } from '../context/RoleChurnContext';
import { useRoleChurn } from '../hooks/useRoleChurn';

const NAV_LINKS = [
  { label: 'Panel', href: '/panel' },
  { label: 'Métricas', href: '/metricas' },
  // { label: 'El Modelo', href: '/modelo' },
  { label: 'Predicciones', href: '/predicciones' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { role, setRole } = useRoleChurn();
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ActivityIcon className="size-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">
              Churn Prediction
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Retención Inteligente
            </span>
          </span>
        </Link>

        <NavigationMenu className="hidden md:block">
          <NavigationMenuList>
            {NAV_LINKS.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    to={link.href}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive(link.href) && 'bg-accent text-accent-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <RoleSwitcher
            role={role}
            onRoleChange={setRole}
            className="hidden sm:flex"
          />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive(link.href) && 'bg-accent text-accent-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
            <Separator className="my-2" />
            <RoleSwitcher role={role} onRoleChange={setRole} />
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function RoleSwitcher({
  role,
  onRoleChange,
  className,
}: {
  role: Role;
  onRoleChange: (role: Role) => void;
  className?: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={role}
      onValueChange={(value) => {
        const next = value as Role | undefined;
        if (next) onRoleChange(next);
      }}
      className={cn('rounded-lg border border-border bg-card p-0.5', className)}
      aria-label="Seleccionar perfil de usuario"
    >
      <ToggleGroupItem
        value="agent"
        className="cursor-pointer gap-1.5 rounded-md px-3 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <HeadphonesIcon />
        Agente
      </ToggleGroupItem>
      <ToggleGroupItem
        value="analyst"
        className="cursor-pointer gap-1.5 rounded-md px-3 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <LineChartIcon />
        Analista
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
