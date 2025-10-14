import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubRepoStats, type GitHubRepoStats } from '@/lib/github';

/**
 * API Response types
 */
interface SuccessResponse {
  success: true;
  data: GitHubRepoStats;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

/**
 * GET /api/github/[owner]/[repo]
 * Fetches GitHub repository statistics server-side
 *
 * @param request - Next.js request object
 * @param params - Dynamic route parameters { owner, repo }
 * @returns JSON response with repository stats or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    // Await the params as required by Next.js 15
    const { owner, repo } = await params;

    // Validate parameters
    if (!owner || !repo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: owner and repo',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate owner and repo format (basic validation)
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(owner) || !validPattern.test(repo)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid owner or repo name format',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Fetch repository stats using the lib/github.ts function
    const stats = await fetchGitHubRepoStats(owner, repo);

    // If stats is null, the repository was not found or API failed
    if (!stats) {
      return NextResponse.json(
        {
          success: false,
          error: 'Repository not found or GitHub API request failed. This could be due to rate limiting, invalid repository, or network issues.',
        } as ErrorResponse,
        { status: 404 }
      );
    }

    // Return successful response with CORS headers
    return NextResponse.json(
      {
        success: true,
        data: stats,
      } as SuccessResponse,
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error in GitHub API route:', error);

    // Return 500 error for unexpected failures
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while fetching repository data',
      } as ErrorResponse,
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/github/[owner]/[repo]
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
