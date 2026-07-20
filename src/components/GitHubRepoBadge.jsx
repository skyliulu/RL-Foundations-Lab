import { useEffect, useState } from 'react'

const REPOSITORY_URL = 'https://github.com/skyliulu/RL-Foundations-Lab'
const REPOSITORY_API_URL = 'https://api.github.com/repos/skyliulu/RL-Foundations-Lab'

function formatStarCount(count) {
  if (!Number.isFinite(count)) return '—'
  if (count < 1000) return new Intl.NumberFormat('en-US').format(count)
  if (count < 10000) return `${(count / 1000).toFixed(1).replace('.0', '')}k`
  return `${Math.round(count / 1000)}k`
}

export default function GitHubRepoBadge({ lang }) {
  const [stars, setStars] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadRepositoryMetadata() {
      try {
        const response = await fetch(REPOSITORY_API_URL, { signal: controller.signal })
        if (!response.ok) return
        const repository = await response.json()
        if (Number.isFinite(repository.stargazers_count)) setStars(repository.stargazers_count)
      } catch (error) {
        if (error.name !== 'AbortError') setStars(null)
      }
    }

    loadRepositoryMetadata()
    return () => controller.abort()
  }, [])

  const starCount = formatStarCount(stars)
  const label = lang === 'zh'
    ? `打开 GitHub 仓库，${stars === null ? 'Star 数暂不可用' : `${starCount} 个 Star`}`
    : `Open the GitHub repository, ${stars === null ? 'star count unavailable' : `${starCount} stars`}`

  return (
    <a className="github-repo-badge" href={REPOSITORY_URL} target="_blank" rel="noreferrer" aria-label={label} title={label}>
      <svg className="github-mark" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.39.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.16 1.18A10.98 10.98 0 0 1 12 6.13c.98 0 1.95.13 2.86.38 2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.28c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
      </svg>
      <span className="github-repo-label">GitHub</span>
      <span className="github-star-count"><span aria-hidden="true">★</span>{starCount}</span>
    </a>
  )
}
