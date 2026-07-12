"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { motion } from "framer-motion"
import { TrendingUp, Activity } from "lucide-react"

import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

type IPCData = {
  fecha: string
  valor: number
}

type ApiResponse = {
  data: IPCData[]
}

const formatXAxis = (tickItem: string) => {
  if (!tickItem) return ""
  try {
    // Para YYYY-MM
    let dateStr = tickItem
    if (tickItem.length === 7) dateStr = `${tickItem}-01`
    return format(parseISO(dateStr), "MMM yy", { locale: es })
  } catch (e) {
    return tickItem
  }
}

export function IPCChart() {
  const [data, setData] = useState<IPCData[]>([])
  const [latestValue, setLatestValue] = useState<number | null>(null)
  const [latestDate, setLatestDate] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch("/v1/ipc?historico=true")
        if (!response.ok) throw new Error("Error fetching IPC data")
        
        const result: ApiResponse = await response.json()
        const historyData = result.data

        if (historyData && historyData.length > 0) {
          const displayData = historyData.slice(-24)
          
          setData(displayData)
          setLatestValue(historyData[historyData.length - 1].valor)
          
          let dateStr = historyData[historyData.length - 1].fecha
          if (dateStr.length === 7) dateStr = `${dateStr}-01`
          setLatestDate(format(parseISO(dateStr), "MMMM yyyy", { locale: es }))
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="h-full bg-card/40 backdrop-blur-md border border-border/50 shadow-xl overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center text-muted-foreground animate-pulse">
          <Activity className="h-8 w-8 mb-4" />
          <p>Obteniendo registros del INDEC...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full bg-card/40 backdrop-blur-md border border-destructive/50 overflow-hidden min-h-[400px] flex items-center justify-center">
        <p className="text-destructive font-medium">Error: {error}</p>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-card/40 backdrop-blur-xl border border-border/50 shadow-[0_0_30px_rgba(var(--primary),0.05)] overflow-hidden hover:border-primary/30 transition-all duration-300">
        <CardHeader className="flex flex-col md:flex-row md:items-start justify-between border-b border-border/20 pb-6 gap-6">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              IPC Nacional
            </CardTitle>
            <CardDescription className="text-sm">
              Evolución porcentual inflacionaria.
            </CardDescription>
          </div>
          
          <div className="flex flex-col items-start md:items-end bg-background/50 backdrop-blur-md rounded-xl p-3 border border-border/50">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1 capitalize">
              {latestDate}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {latestValue}%
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 pb-4 flex-1">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValorIpc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="fecha" 
                  stroke="oklch(0.28 0 0)" 
                  tick={{ fill: 'oklch(0.65 0 0)', fontSize: 11 }} 
                  tickMargin={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatXAxis}
                />
                <YAxis 
                  stroke="oklch(0.28 0 0)" 
                  tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    borderColor: 'oklch(0.28 0 0)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="oklch(0.72 0.18 220)" /* primary color */
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
