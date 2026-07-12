"use client"

import { useState, useEffect, useMemo } from "react"
import { apiFetch } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { format, addMonths, subMonths, isAfter, isBefore, parseISO, startOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Calculator, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  ArrowRight, 
  Info,
  AlertCircle,
  BarChart3,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type ICLItem = { fecha: string; valor: number }
type IPCItem = { mes: number; anio: number; nombre_mes: string; valor: number }

function parseDMY(s: string): Date {
  const [d, m, y] = s.split("/")
  return new Date(Number(y), Number(m) - 1, Number(d))
}

export function RentCalculator() {
  const [basePrice, setBasePrice] = useState<string>("100000")
  const [indexType, setIndexType] = useState<"icl" | "ipc">("icl")
  const [startDate, setStartDate] = useState<string>(format(subMonths(new Date(), 6), "yyyy-MM-dd"))
  const [period, setPeriod] = useState<string>("6")
  const [lagMonths, setLagMonths] = useState<string>("2") // Default lag 2 months for IPC
  
  const [iclData, setIclData] = useState<ICLItem[]>([])
  const [ipcData, setIpcData] = useState<IPCItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [iclRes, ipcRes] = await Promise.all([
          apiFetch("/v1/icl?historico=true"),
          apiFetch("/v1/ipc?historico=true")
        ])
        const [iclJson, ipcJson] = await Promise.all([iclRes.json(), ipcRes.json()])
        setIclData(iclJson.data || [])
        setIpcData(ipcJson.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const calculation = useMemo(() => {
    if (loading || (!iclData.length && !ipcData.length)) return null

    const start = parseISO(startDate)
    const end = addMonths(start, Number(period))
    const price = parseFloat(basePrice) || 0

    if (indexType === "icl") {
      // Find closest ICL for start date
      const startItem = iclData.reduce((prev, curr) => {
        const currDate = parseDMY(curr.fecha)
        const prevDate = parseDMY(prev.fecha)
        return Math.abs(currDate.getTime() - start.getTime()) < Math.abs(prevDate.getTime() - start.getTime()) ? curr : prev
      }, iclData[0])

      const clampedEnd = isAfter(end, new Date()) ? new Date() : end
      const endItem = iclData.reduce((prev, curr) => {
        const currDate = parseDMY(curr.fecha)
        const prevDate = parseDMY(prev.fecha)
        return Math.abs(currDate.getTime() - clampedEnd.getTime()) < Math.abs(prevDate.getTime() - clampedEnd.getTime()) ? curr : prev
      }, iclData[iclData.length - 1])
      
      const factor = endItem.valor / startItem.valor
      const updatedPrice = price * factor
      
      // Chart data: all points between start and end (with sampling if too many)
      const filtered = iclData.filter(d => {
        const dDate = parseDMY(d.fecha)
        return !isBefore(dDate, start) && !isAfter(dDate, end)
      })

      // Sample data if too dense
      const maxPoints = 50
      const sampled = filtered.filter((_, i) => i % Math.max(1, Math.floor(filtered.length / maxPoints)) === 0)

      const history = sampled.map(d => ({
        label: d.fecha.slice(0, 5),
        valor: d.valor
      }))

      return {
        factor,
        updatedPrice,
        increase: updatedPrice - price,
        percentage: (factor - 1) * 100,
        history: history.length > 0 ? history : [{ label: 'N/A', valor: 0 }],
        isFuture: isAfter(end, new Date())
      }
    } else {
      // IPC Calculation (Compound)
      // Standard practice: shift window by lag months because data is published with delay
      const lag = Number(lagMonths)
      const shiftedStart = subMonths(start, lag)
      const shiftedEnd = subMonths(end, lag)

      const monthsInRange = ipcData.filter(d => {
        const dDate = new Date(d.anio, d.mes - 1, 1)
        return !isBefore(dDate, startOfMonth(shiftedStart)) && isBefore(dDate, startOfMonth(shiftedEnd))
      })

      if (monthsInRange.length === 0) {
        return null
      }

      let factor = 1
      monthsInRange.forEach(m => {
        factor *= (1 + m.valor / 100)
      })

      const updatedPrice = price * factor
      const history = monthsInRange.map(m => ({
        label: `${m.nombre_mes.slice(0, 3)} ${String(m.anio).slice(2)}`,
        valor: m.valor
      }))

      const monthBreakdown = monthsInRange.map(m => ({
        name: m.nombre_mes.slice(0, 3),
        value: m.valor
      }))

      return {
        factor,
        updatedPrice,
        increase: updatedPrice - price,
        percentage: (factor - 1) * 100,
        history,
        monthBreakdown,
        isFuture: isAfter(end, new Date())
      }
    }
  }, [basePrice, indexType, startDate, period, lagMonths, iclData, ipcData, loading])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── Inputs Panel ── */}
      <Card className="lg:col-span-5 bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Parámetros del Contrato
          </CardTitle>
          <CardDescription>
            Ingresá los datos de tu contrato para calcular el ajuste.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Obteniendo índices oficiales...</p>
            </div>
          ) : (
            <>
              {/* Base Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Monto de Alquiler Actual</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                  <Input 
                    type="number" 
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="pl-8 bg-background/50 border-border/50 focus:ring-primary"
                    placeholder="Ej: 150000"
                  />
                </div>
              </div>

              {/* Index Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Índice de Actualización</label>
                <Select value={indexType} onValueChange={(val: any) => setIndexType(val)}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Seleccionar índice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icl">ICL (Índice para Contratos de Locación)</SelectItem>
                    <SelectItem value="ipc">IPC (Inflación Mensual)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3" />
                  {indexType === 'icl' 
                    ? 'Oficial del BCRA. Se usa para contratos vigentes de la Ley 27.551.' 
                    : 'Oficial del INDEC. Común en contratos nuevos bajo DNU 70/2023.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-background/50 border-border/50 block w-full"
                    />
                  </div>
                </div>

                {/* Period */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Período (meses)</label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 meses</SelectItem>
                      <SelectItem value="3">3 meses</SelectItem>
                      <SelectItem value="4">4 meses</SelectItem>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {indexType === 'ipc' && (
                <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Meses de rezago</label>
                    <div className="group relative">
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 border border-border/50 rounded-lg text-[10px] leading-relaxed text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        Debido a que el INDEC publica el IPC a mediados del mes siguiente, los contratos suelen usar el índice de 1 o 2 meses atrás. 
                        <strong> El estándar es 2 meses.</strong>
                      </div>
                    </div>
                  </div>
                  <Select value={lagMonths} onValueChange={setLagMonths}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sin rezago (Uso teórico)</SelectItem>
                      <SelectItem value="1">1 mes de rezago</SelectItem>
                      <SelectItem value="2">2 meses de rezago (Estándar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Results Panel ── */}
      <div className="lg:col-span-7 space-y-6">
        <AnimatePresence mode="wait">
          {calculation && (
            <motion.div
              key={`${indexType}-${startDate}-${period}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Card className="bg-primary/5 border-primary/20 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="h-24 w-24" />
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">
                    Resultado del Ajuste
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <p className="text-4xl font-black text-foreground">
                        ${calculation.updatedPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Monto actualizado a pagar
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-right">
                      <p className="text-emerald-400 font-bold text-xl">
                        +{calculation.percentage.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-emerald-500/70 uppercase font-semibold">
                        Aumento Calculado
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">DIFERENCIA MENSUAL</span>
                      <span className="text-lg font-bold text-foreground">
                        +${calculation.increase.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase">COEFICIENTE APLICADO</span>
                      <span className="text-lg font-bold text-foreground">
                        {calculation.factor.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown for IPC */}
                  {indexType === 'ipc' && calculation.monthBreakdown && (
                    <div className="mt-4 pt-4 border-t border-border/10">
                      <span className="text-[10px] text-muted-foreground block uppercase mb-2 font-bold">Composición de la inflación:</span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {calculation.monthBreakdown.map((m: any, i: number) => (
                          <div key={i} className="bg-background/40 border border-border/50 rounded p-1.5 text-center">
                            <div className="text-[9px] text-muted-foreground uppercase">{m.name}</div>
                            <div className="text-[11px] font-bold text-primary">+{m.value}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {calculation.isFuture && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-2 items-start">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-200/80 leading-relaxed">
                        La fecha de actualización aún no ha llegado. Se utilizaron los últimos valores oficiales disponibles para realizar la estimación.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chart */}
              <Card className="bg-card/30 border-border/40 backdrop-blur-md overflow-hidden min-h-[300px]">
                <CardHeader className="py-4 border-b border-border/10">
                  <CardTitle className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Evolución del {indexType.toUpperCase()} en el período
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  {calculation.history && calculation.history.length > 1 ? (
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={calculation.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="label" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={30}
                            stroke="#94a3b8"
                          />
                          <YAxis 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            width={56}
                            domain={['dataMin - 1', 'dataMax + 1']}
                            stroke="#94a3b8"
                          />
                          <Tooltip 
                             contentStyle={{ 
                              backgroundColor: '#000', 
                              borderRadius: '8px', 
                              border: '1px solid #333',
                              fontSize: '12px',
                              color: '#fff'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="valor" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorIndex)" 
                            isAnimationActive={false}
                            dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2 border border-dashed border-border/20 rounded-lg">
                      <AlertCircle className="h-6 w-6 opacity-30" />
                      <p className="text-xs">No hay suficientes datos para el rango seleccionado.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
