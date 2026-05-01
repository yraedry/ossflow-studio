import { Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useScrapperScrape } from '@/features/scrapper/api/useScrapper'

export default function ScrapperScrapeButton({ path, url, disabled, onScraped, label = 'Scrapear contenido' }) {
  const scrape = useScrapperScrape()
  const isDisabled = disabled || !url || scrape.isPending

  async function handleClick() {
    try {
      const result = await scrape.mutateAsync({ path, url })
      toast.success('Capítulos scrapeados')
      onScraped?.(result)
    } catch (e) {
      toast.error(`Error scrapeando: ${e.message || 'desconocido'}`)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isDisabled}>
      {scrape.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {scrape.isPending ? 'Scrapeando…' : label}
    </Button>
  )
}
