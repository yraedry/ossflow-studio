// Scrapper (BJJFanatics) domain.
// Endpoints (verified against ossflow_api/modules/scrapper — prefix /api/scrapper):
//   GET    /providers
//   GET    /{instructional_path}                       (current .bjj-meta oracle block)
//   PUT    /{instructional_path}                       (save)
//   DELETE /{instructional_path}                       (clear)
//   POST   /{instructional_path}/resolve               (search + best-match)
//   POST   /{instructional_path}/scrape                (scrape a specific URL)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/httpClient'
import { qk } from '@/lib/queryKeys'

const enc = encodeURIComponent

export function useProviders() {
  return useQuery({
    queryKey: qk.scrapper.providers,
    queryFn: () => http.get('/scrapper/providers'),
    staleTime: 10 * 60_000,
  })
}

export function useScrapperData(path) {
  return useQuery({
    queryKey: qk.scrapper.detail(path),
    queryFn: () => http.get(`/scrapper/${enc(path)}`),
    enabled: !!path,
    staleTime: 60_000,
  })
}

// Search is implemented server-side via the `resolve` endpoint (search+scrape).
// Exposed here as a lazy mutation; callers that want a debounced "search-as-you-type"
// should compose with `useDebouncedValue` from the search feature.
export function useResolveUrl() {
  return useMutation({
    mutationFn: ({ path, providerId, title, author }) => {
      const body = {}
      if (providerId) body.provider_id = providerId
      if (title) body.title = title
      if (author) body.author = author
      return http.post(`/scrapper/${enc(path)}/resolve`, body)
    },
  })
}

// Poster may have been auto-downloaded by the backend (scrape/PUT), which
// updates the scan cache — invalidate library queries so has_poster re-reads.
function invalidateScrapperAndLibrary(qc, path) {
  qc.invalidateQueries({ queryKey: qk.scrapper.detail(path) })
  qc.invalidateQueries({ queryKey: qk.library.list() })
  qc.invalidateQueries({ queryKey: qk.library.detail(path) })
}

export function useScrapperScrape() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ path, url }) => http.post(`/scrapper/${enc(path)}/scrape`, { url }),
    onSuccess: (_d, { path }) => invalidateScrapperAndLibrary(qc, path),
  })
}

export function useUpdateScrapper() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ path, oracle }) => http.put(`/scrapper/${enc(path)}`, oracle),
    onSuccess: (_d, { path }) => invalidateScrapperAndLibrary(qc, path),
  })
}

export function useDeleteScrapper() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ path }) => http.del(`/scrapper/${enc(path)}`),
    onSuccess: (_d, { path }) => qc.invalidateQueries({ queryKey: qk.scrapper.detail(path) }),
  })
}

// Convenience alias so pages reading "search" semantics can import it from here.
// Note: the real product search lives in resolve(); `useScrapperSearch` is a thin
// wrapper that pairs a query string with the active provider.
export function useScrapperSearch() {
  return useResolveUrl()
}
