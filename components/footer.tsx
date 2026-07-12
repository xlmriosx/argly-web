"use client"

import { Github, Coffee, Heart, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

interface PersonaDesaparecida {
  nombre: string
  slug: string
  url: string
  fecha_desaparicion: string
  recompensa: {
    tiene_recompensa: boolean
    monto: string | null
  }
  descripcion: string
  foto_url: string
  anio_desaparicion?: number
}

export function Footer() {
  const [persona, setPersona] = useState<PersonaDesaparecida | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    async function fetchPersona() {
      try {
        const res = await apiFetch("/v1/personas-desaparecidas")
        if (!res.ok) return
        const json = await res.json()
        const personas: PersonaDesaparecida[] = json?.data?.personas ?? []
        if (personas.length === 0) return
        // Pick a random person
        const randomIndex = Math.floor(Math.random() * personas.length)
        setPersona(personas[randomIndex])
      } catch {
        // Silently fail – the banner just won't appear
      }
    }
    fetchPersona()
  }, [])

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-")
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-0">
              <img src="/icon.png" alt="Argly Logo" className="w-7 h-7 object-contain -mr-1.5" />
              <h3 className="text-lg font-semibold">Argly</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Datos públicos de Argentina accesibles para todos los desarrolladores.
            </p>
            <div className="mt-4 flex flex-col gap-2 items-start">
              <Button
                size="sm"
                variant="outline"
                asChild
                className="border-accent/20 bg-accent/5 hover:bg-accent/10 hover:text-accent"
              >
                <Link href="https://cafecito.app/williamjuanjoselopez" target="_blank" rel="noopener noreferrer">
                  <Coffee className="mr-2 h-4 w-4" />
                  Apoyar proyecto
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                asChild
                className="border-accent/20 bg-accent/5 hover:bg-accent/10 hover:text-accent"
              >
                <Link href="https://github.com/sponsors/William10101995" target="_blank" rel="noopener noreferrer">
                  <Heart className="mr-2 h-4 w-4 text-red-500" />
                  Sponsor
                </Link>
              </Button>
            </div>
            {/* </CHANGE> */}
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Documentación</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#docs" className="text-muted-foreground hover:text-foreground">
                  Introducción
                </Link>
              </li>
              <li>
                <Link href="#docs" className="text-muted-foreground hover:text-foreground">
                  Endpoints
                </Link>
              </li>
              <li>
                <Link href="#playground" className="text-muted-foreground hover:text-foreground">
                  Playground
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Comunidad</h4>
            <div className="flex gap-4 mb-3">
              <Link href="https://github.com/William10101995/argly" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://x.com/argly_ar" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                </svg>
              </Link>
            </div>
            <Link
              href="mailto:contacto@argly.com.ar"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              contacto@argly.com.ar
            </Link>
          </div>

          {/* Persona Desaparecida – 4th column */}
          {persona && (
            <div style={{ animation: "fadeInUp 0.8s ease-out both" }}>
              <Link
                href={persona.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <h4 className="mb-4 text-sm font-semibold">Persona Desaparecida</h4>
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border/40 mb-3">
                  {!imgError ? (
                    <img
                      src={persona.foto_url}
                      alt={persona.nombre}
                      className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground text-xs">
                      ?
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-tight">
                  {persona.nombre}
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  Desaparecido/a el {formatDate(persona.fecha_desaparicion)}
                </p>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 argly.com.ar - Datos obtenidos de fuentes públicas.</p>
        </div>
      </div>
    </footer>
  )
}
