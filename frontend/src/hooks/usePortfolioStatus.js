import { useState, useEffect, useRef } from 'react'
import api from '../lib/api'

/**
 * Polls /api/portfolio/:id/status every `intervalMs` milliseconds.
 * Stops automatically when status becomes 'live' or 'failed'.
 *
 * Usage:
 *   const { status, deployedUrl, loading } = usePortfolioStatus(portfolioId)
 */
export function usePortfolioStatus(portfolioId, intervalMs = 10000) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const fetch = async () => {
    if (!portfolioId) return
    try {
      const res = await api.get(`/portfolio/${portfolioId}/status`)
      setData(res.data)
      // Stop polling when terminal state reached
      if (res.data.status === 'live' || res.data.status === 'failed') {
        clearInterval(timerRef.current)
      }
    } catch {
      // silently ignore network blips — keep polling
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!portfolioId) return
    fetch()
    timerRef.current = setInterval(fetch, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [portfolioId, intervalMs])

  return {
    status:      data?.status,
    statusMessage: data?.statusMessage,
    deployedUrl: data?.deployedUrl,
    githubUrl:   data?.githubRepoUrl,
    generatedAt: data?.generatedAt,
    loading,
  }
}
