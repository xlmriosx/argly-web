"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion, Variants } from "framer-motion"

const sources = [
  {
    name: "Combustibles.AR",
    description: "Precios de combustibles por provincia y estación de servicio.",
    logo: "/Logo_combustibles.png",
    url: "https://combustibles.ar/",
  },
  {
    name: "INDEC",
    description: "IPC, CBA, CBT, ICC, SMVM, Datos Censales.",
    logo: "/Logo_Indec1.png",
    url: "https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31",
  },
  {
    name: "Prefectura Naval Argentina",
    description: "Altura de los ríos en cada puerto del país.",
    logo: "/Logo_prefectura.png",
    url: "https://contenidosweb.prefecturanaval.gob.ar/alturas/",
  },

  {
    name: "Banco Central de la República Argentina",
    description: "ICL, UVA, UVI, CER.",
    logo: "/Logo_BCRA.png",
    url: "https://www.bcra.gob.ar/estadisticas-indicadores/",
  },
  {
    name: "Ministerio de Salud de la Nación",
    description: "Precios de referencia de medicamentos.",
    logo: "/Logo_salud.png",
    url: "https://www.argentina.gob.ar/salud",
  },
  {
    name: "Ministerio de Seguridad de la Nación",
    description: "Registro de personas desaparecidas (SIFEBU).",
    logo: "/Logo_seguridad.png",
    url: "https://www.argentina.gob.ar/seguridad/personasextraviadas",
  },
  {
    name: "Ámbito",
    description: "Riesgo País.",
    logo: "/logo_ambito.webp",
    url: "https://www.ambito.com/contenidos/riesgo-pais.html",
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export function DataSources() {
  return (
    <section className="relative border-b border-border py-24 sm:py-32 bg-background overflow-hidden">
      {/* Background glow similar to Features */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Respaldado por <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Fuentes Oficiales</span>
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">
              Toda la información se sincroniza y verifica directamente desde los organismos gubernamentales correspondientes.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {sources.map((source) => (
            <motion.div key={source.name} variants={itemVariants}>
              <Card className="group h-full bg-card/40 backdrop-blur-md border hover:border-primary/40 border-border/50 text-card-foreground transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary),0.05)] hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center flex-1 w-full"
                    aria-label={`Visitar ${source.name}`}
                  >
                    <div className="mb-6 flex h-24 w-full items-center justify-center rounded-xl bg-background/50 p-6 ring-1 ring-border/50 group-hover:ring-primary/20 transition-all duration-300">
                      <img
                        src={source.logo || "/placeholder.svg"}
                        alt={`Logo de ${source.name}`}
                        className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-end text-center w-full">
                      <h3 className="mb-2 text-base font-semibold leading-tight group-hover:text-primary transition-colors">{source.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {source.description}
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
