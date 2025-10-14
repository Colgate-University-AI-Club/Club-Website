/**
 * GitHub API client for fetching repository metadata
 * Includes caching mechanism to avoid rate limits (5000 requests/hour)
 */

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  lastUpdated: string;
  contributors: number;
  language: string | null;
  isArchived: boolean;
}

interface GitHubAPIResponse {
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string | null;
  archived: boolean;
}

interface CacheEntry {
  data: GitHubRepoStats;
  timestamp: number;
}

// In-memory cache with 1-hour TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Parse GitHub repository URL to extract owner and repo name
 * @param url GitHub repository URL (e.g., "https://github.com/owner/repo")
 * @returns Object with owner and repo, or null if invalid
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') {
      return null;
    }

    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      return null;
    }

    return {
      owner: pathParts[0],
      repo: pathParts[1].replace(/\.git$/, ''), // Remove .git extension if present
    };
  } catch {
    return null;
  }
}

/**
 * Fetch GitHub repository metadata with caching
 * @param owner Repository owner (username or organization)
 * @param repo Repository name
 * @returns Repository stats or null if request fails
 */
export async function fetchGitHubRepoStats(
  owner: string,
  repo: string
): Promise<GitHubRepoStats | null> {
  const cacheKey = `${owner}/${repo}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('GITHUB_TOKEN not set, skipping GitHub API request');
      return null;
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`,
    };

    // Fetch repository metadata
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers, next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        console.warn(`Repository ${owner}/${repo} not found`);
      } else if (repoResponse.status === 403) {
        console.error('GitHub API rate limit exceeded');
      } else {
        console.error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
      }
      return null;
    }

    const repoData: GitHubAPIResponse = await repoResponse.json();

    // Fetch contributors count
    let contributorsCount = 0;
    try {
      const contributorsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1`,
        { headers, next: { revalidate: 3600 } }
      );

      if (contributorsResponse.ok) {
        // Parse Link header to get total count
        const linkHeader = contributorsResponse.headers.get('Link');
        if (linkHeader) {
          const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (lastPageMatch) {
            contributorsCount = parseInt(lastPageMatch[1], 10);
          } else {
            // If no pagination, count the response
            const contributors = await contributorsResponse.json();
            contributorsCount = Array.isArray(contributors) ? contributors.length : 0;
          }
        } else {
          // No Link header means all contributors fit in one page
          const contributors = await contributorsResponse.json();
          contributorsCount = Array.isArray(contributors) ? contributors.length : 0;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch contributors for ${owner}/${repo}:`, error);
      // Continue without contributors count
    }

    const stats: GitHubRepoStats = {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      lastUpdated: repoData.updated_at,
      contributors: contributorsCount,
      language: repoData.language,
      isArchived: repoData.archived,
    };

    // Cache the result
    cache.set(cacheKey, {
      data: stats,
      timestamp: Date.now(),
    });

    return stats;
  } catch (error) {
    console.error(`Error fetching GitHub stats for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Fetch GitHub repository stats from a full repository URL
 * @param repoUrl Full GitHub repository URL
 * @returns Repository stats or null if invalid URL or request fails
 */
export async function fetchGitHubRepoStatsByUrl(
  repoUrl: string
): Promise<GitHubRepoStats | null> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    console.warn(`Invalid GitHub URL: ${repoUrl}`);
    return null;
  }

  return fetchGitHubRepoStats(parsed.owner, parsed.repo);
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
