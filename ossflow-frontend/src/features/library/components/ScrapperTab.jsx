// Oracle tab — thin wrapper over scrapper feature components.
// Shows URL input when no oracle yet, or VolumeEditor + PosterPreview when present.
// (UX preserva la palabra "Oracle" como nombre del producto/feature.)
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ExternalLink, RefreshCw, Settings2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useScrapperData } from '@/features/scrapper/api/useScrapper'
import ScrapperUrlInput from '@/features/scrapper/components/ScrapperUrlInput'
import ScrapperAutoResolve from '@/features/scrapper/components/ScrapperAutoResolve'
import VolumeEditor from '@/features/scrapper/components/VolumeEditor'

export default function ScrapperTab({ instructional }) {
  const path = instructional?.path || instructional?.name
  const { data: oracle, isLoading, isError, error, refetch } = useScrapperData(path)

  const hasOracle = !!oracle && Array.isArray(oracle.volumes)
  const noOracleYet = isError && error?.status === 404
  const productUrl = oracle?.product_url

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[4fr_1fr]">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (noOracleYet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl"
      >
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-amber-400" /> Aún no hay oráculo
            </CardTitle>
            <CardDescription>
              Pega la URL del producto en BJJFanatics para scrapear los capítulos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <ScrapperAutoResolve path={path} onResolved={() => refetch()} />
            </div>
            <div className="my-3 flex items-center gap-2 text-[11px] text-zinc-600">
              <div className="h-px flex-1 bg-zinc-800" />
              <span>o pega la URL manualmente</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            <ScrapperUrlInput path={path} autoFocus onResolved={() => refetch()} />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">
        Error cargando oracle: {error?.message || 'desconocido'}
        <Button
          size="sm"
          variant="outline"
          className="ml-3"
          onClick={() => refetch()}
        >
          <RefreshCw className="mr-1 h-3 w-3" /> Reintentar
        </Button>
      </div>
    )
  }

  if (!hasOracle) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {productUrl && (
            <a
              href={productUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> {productUrl}
            </a>
          )}
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link to={`/library/${encodeURIComponent(instructional?.name || '')}/scrapper`}>
            <Settings2 className="mr-1 h-3 w-3" /> Editor completo
          </Link>
        </Button>
      </div>

      <VolumeEditor
        path={path}
        oracle={oracle}
        onSaved={() => refetch()}
        onDeleted={() => refetch()}
      />
    </div>
  )
}
