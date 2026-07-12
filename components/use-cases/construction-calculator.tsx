"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { 
  HardHat, 
  Ruler, 
  Info, 
  TrendingUp, 
  ArrowRight, 
  Hammer, 
  BrickWall, 
  Wallet,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ICCData {
  anio: number
  mes: number
  fecha_publicacion: string
  precio_m2_actual: {
    total: number
    materiales: number
    mano_obra: number
    gastos_generales: number
  }
  variaciones: {
    general: number
    materiales: number
    mano_obra: number
    gastos_generales: number
  }
}

export function ConstructionCalculator() {
  const [meters, setMeters] = useState<string>("100")
  const [data, setData] = useState<ICCData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiFetch("/v1/construccion")
        if (!res.ok) throw new Error("Error al obtener datos")
        const json = await res.json()
        setData(json.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const currentMeters = parseFloat(meters) || 0
  const totalPrice = data ? data.precio_m2_actual.total * currentMeters : 0
  const materialesPrice = data ? data.precio_m2_actual.materiales * currentMeters : 0
  const manoObraPrice = data ? data.precio_m2_actual.mano_obra * currentMeters : 0
  const gastosPrice = data ? data.precio_m2_actual.gastos_generales * currentMeters : 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Obteniendo datos del ICC...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6 text-center">
          <p className="text-destructive font-medium">No se pudieron cargar los datos del ICC.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ── Left Column: Input ────────────────────────────────────────── */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Ruler className="h-24 w-24 -rotate-12" />
          </div>
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-primary" />
              Configurar Obra
            </CardTitle>
            <CardDescription>
              Ingresá los metros cuadrados cubiertos estimados.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Superficie Total (m2)
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={meters}
                  onChange={(e) => setMeters(e.target.value)}
                  placeholder="Ej: 100"
                  className="w-full rounded-xl border border-border bg-background px-4 py-4 text-2xl font-bold tracking-tight focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/30"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  m2
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="text-foreground/90 font-medium">Datos del ICC (INDEC)</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Basado en el informe de <strong>{months[data.mes - 1]} {data.anio}</strong>. 
                    Referencia: Vivienda unifamiliar tipo.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Valor m2 Actual</p>
                <p className="text-xl font-black text-primary">
                  ${data.precio_m2_actual.total.toLocaleString("es-AR")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Variación Mensual</p>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <TrendingUp className="h-4 w-4" />
                  {data.variaciones.general}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Materiales", icon: BrickWall, value: data.variaciones.materiales, color: "text-blue-400" },
            { label: "Mano de Obra", icon: Hammer, value: data.variaciones.mano_obra, color: "text-purple-400" },
            { label: "Gastos", icon: Wallet, value: data.variaciones.gastos_generales, color: "text-amber-400" },
          ].map((item) => (
            <div key={item.label} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-4 flex flex-col items-center gap-2 text-center group hover:border-primary/20 transition-colors">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{item.label}</p>
              <p className="text-sm font-black">+{item.value}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Column: Results ─────────────────────────────────────── */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="h-full bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />
                    <CardContent className="flex-1 flex flex-col justify-start pt-4 gap-2">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-black text-muted-foreground/80">
                Estimación de Costo Total
              </h3>
            </div>

            <div className="py-2">
              <motion.div
                key={totalPrice}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-foreground/80 break-all sm:break-normal leading-tight"
              >
                ${totalPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </motion.div>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                PESOS ARGENTINOS (ARS)
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-px bg-border/50 w-full" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <BrickWall className="h-3 w-3 text-blue-400" />
                      Materiales
                    </p>
                    <p className="text-xl font-bold tracking-tight">
                      ${materialesPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Hammer className="h-3 w-3 text-purple-400" />
                      Mano de Obra
                    </p>
                    <p className="text-xl font-bold tracking-tight">
                      ${manoObraPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Wallet className="h-3 w-3 text-amber-400" />
                      Gastos Generales
                    </p>
                    <p className="text-xl font-bold tracking-tight">
                      ${gastosPrice.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aviso Legal</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Valores de referencia publicados por INDEC para una vivienda unifamiliar tipo. No incluye terreno, honorarios profesionales ni tasas municipales.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
