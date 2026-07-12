"use client"

import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Waves, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Clock, 
  Navigation,
  Info,
  Loader2,
  ChevronDown
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"

type Puerto = {
  nombre: string
  altura_m: number
  variacion_m: number
  estado: string // 'crece', 'baja', 'estac', 's/e', etc.
  fecha: string
  hora: string
}

type Rio = {
  nombre: string
  estado_general: string
  resumen: {
    puertos_total: number
    crece: number
    baja: number
    estac: number
  }
  puertos: Puerto[]
}

type ApiResponse = {
  rios: Rio[]
  updated_at: string
}

export function RiverMonitor() {
  const [data, setData] = useState<Rio[]>([])
  const [updatedAt, setUpdatedAt] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiFetch("/v1/rios")
        const json: any = await res.json()
        const riverData = json.data?.rios || []
        setData(riverData)
        setUpdatedAt(json.data?.updated_at || "")
      } catch (error) {
        console.error("Error fetching river data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    return data.map(rio => ({
      ...rio,
      puertos: rio.puertos.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        rio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(rio => rio.puertos.length > 0)
  }, [data, searchTerm])

  const stats = useMemo(() => {
    const allPorts = data.flatMap(rio => rio.puertos)
    return allPorts.reduce((acc, puerto) => {
      acc.total++
      if (puerto.estado === 'crece') acc.crece++
      else if (puerto.estado === 'baja') acc.baja++
      else if (puerto.estado === 'estac') acc.estac++
      else acc.sin_info++
      return acc
    }, { total: 0, crece: 0, baja: 0, estac: 0, sin_info: 0 })
  }, [data])

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-muted-foreground bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
        <p className="text-lg font-medium">Obteniendo datos de Prefectura...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-sky-500/5 border-sky-500/20 backdrop-blur-xl group hover:border-sky-400/30 transition-all">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">Puertos Totales</p>
                <h4 className="text-3xl font-black">{stats.total}</h4>
              </div>
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <MapPin className="h-5 w-5 text-sky-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 backdrop-blur-xl border-l-4 border-l-emerald-500/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">En Creciente</p>
                <h4 className="text-3xl font-black">{stats.crece}</h4>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg animate-pulse">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-rose-500/5 border-rose-500/20 backdrop-blur-xl border-l-4 border-l-rose-500/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">En Bajada</p>
                <h4 className="text-3xl font-black">{stats.baja}</h4>
              </div>
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-500/5 border-slate-500/20 backdrop-blur-xl border-l-4 border-l-slate-500/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estacionarios</p>
                <h4 className="text-3xl font-black">{stats.estac}</h4>
              </div>
              <div className="p-2 bg-slate-500/10 rounded-lg">
                <Minus className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-500/5 border-zinc-500/20 backdrop-blur-xl border-l-4 border-l-zinc-500/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Sin reporte</p>
                <h4 className="text-3xl font-black">{stats.sin_info}</h4>
              </div>
              <div className="p-2 bg-zinc-500/10 rounded-lg">
                <Info className="h-5 w-5 text-zinc-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Search & Filters ── */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-sky-500 transition-colors" />
        </div>
        <Input 
          type="text" 
          placeholder="Buscar puerto o río (ej: Paraná, Rosario...)" 
          className="pl-10 bg-card/40 backdrop-blur-xl border-border/50 h-12 rounded-xl focus:ring-sky-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ── Main Monitor ── */}
      <div className="space-y-6">
        <Accordion type="multiple" className="space-y-4" defaultValue={data.length > 0 ? [data[0].nombre] : []}>
          {filteredData.map(rio => (
            <AccordionItem 
              key={rio.nombre} 
              value={rio.nombre}
              className="border border-border/50 bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden px-4"
            >
              <AccordionTrigger className="hover:no-underline py-6 group">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Waves className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Río {rio.nombre}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {rio.resumen.puertos_total} puertos monitoreados
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-auto pr-4 hidden sm:flex">
                  <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                    {rio.resumen.crece} ↑
                  </Badge>
                  <Badge variant="outline" className="bg-rose-500/5 text-rose-500 border-rose-500/20">
                    {rio.resumen.baja} ↓
                  </Badge>
                  <Badge variant="outline" className="bg-slate-500/5 text-slate-500 border-slate-500/20">
                    {rio.resumen.estac} ↔
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 h-full">
                  {rio.puertos.map(puerto => (
                    <div 
                      key={puerto.nombre}
                      className="group p-4 bg-background/40 border border-border/50 rounded-xl hover:bg-background/60 transition-all hover:shadow-xl hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-sm tracking-tight group-hover:text-sky-400 transition-colors">
                          {puerto.nombre}
                        </span>
                        <div className={`p-1 rounded uppercase text-[8px] font-bold tracking-widest ${
                          puerto.estado === 'crece' ? 'bg-emerald-500/10 text-emerald-500' :
                          puerto.estado === 'baja' ? 'bg-rose-500/10 text-rose-500' :
                          puerto.estado === 'estac' ? 'bg-slate-500/10 text-slate-400' :
                          'bg-zinc-500/10 text-zinc-500'
                        }`}>
                          {puerto.estado === 's/e' ? 's/info' : puerto.estado}
                        </div>
                      </div>

                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-black">
                          {puerto.altura_m !== null && puerto.altura_m !== undefined 
                            ? puerto.altura_m.toFixed(2) 
                            : "--"}
                          <span className="text-sm font-medium text-muted-foreground ml-1">m</span>
                        </span>
                        <div className={`flex items-center text-xs font-bold mb-1 ${
                          (puerto.variacion_m || 0) > 0 ? 'text-emerald-500' : 
                          (puerto.variacion_m || 0) < 0 ? 'text-rose-500' : 'text-slate-400'
                        }`}>
                          {(puerto.variacion_m || 0) > 0 ? '↑' : (puerto.variacion_m || 0) < 0 ? '↓' : '↔'}
                          {Math.abs(puerto.variacion_m || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-t border-border/20 pt-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {puerto.hora}hs
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {puerto.fecha}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-12 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-amber-500/10 rounded-lg">
          <Info className="h-5 w-5 text-amber-500" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-400">Nota sobre el origen de los datos</h4>
          <p className="text-xs text-amber-200/60 leading-relaxed max-w-4xl">
            La información presentada es obtenida automáticamente del sistema de la <strong>Prefectura Naval Argentina</strong>. 
            Argly no se responsabiliza por demoras o errores en el reporte oficial. Los niveles de alerta y evacuación 
            pueden variar según la jurisdicción específica de cada puerto.
          </p>
        </div>
      </div>
    </div>
  )
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
