"use client"

import {
  ActivityIcon,
  HeadphonesIcon,
  LineChartIcon,
  MenuIcon,
  XIcon,
} from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export type Role = "agent" | "analyst"

const NAV_LINKS = [
  { label: "Panel", href: "#predictor" },
  { label: "El Modelo", href: "#modelo" },
  { label: "Métricas", href: "#metricas" },
  { label: "Documentación", href: "#docs" },
]

export function Navbar({
  role,
  onRoleChange,
}: {
  role: Role
  onRoleChange: (role: Role) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2.5">
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
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <RoleSwitcher
            role={role}
            onRoleChange={onRoleChange}
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
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </a>
            ))}
            <Separator className="my-2" />
            <RoleSwitcher role={role} onRoleChange={onRoleChange} />
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export function RoleSwitcher({
  role,
  onRoleChange,
  className,
}: {
  role: Role
  onRoleChange: (role: Role) => void
  className?: string
}) {
  return (
    <ToggleGroup
      type="single"
      value={role}
      onValueChange={(value) => {
        const next = value as Role | undefined
        if (next) onRoleChange(next)
      }}
      className={cn("rounded-lg border border-border bg-card p-0.5", className)}
      aria-label="Seleccionar perfil de usuario"
    >
      <ToggleGroupItem
        value="agent"
        className="gap-1.5 rounded-md px-3 text-xs font-medium data-[pressed]:bg-primary data-[pressed]:text-primary-foreground"
      >
        <HeadphonesIcon />
        Agente
      </ToggleGroupItem>
      <ToggleGroupItem
        value="analyst"
        className="gap-1.5 rounded-md px-3 text-xs font-medium data-[pressed]:bg-primary data-[pressed]:text-primary-foreground"
      >
        <LineChartIcon />
        Analista
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
