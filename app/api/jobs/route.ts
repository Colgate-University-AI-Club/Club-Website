import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SupabaseJobRow } from '@/lib/types'
import { mapSupabaseJobToJobData } from '@/lib/jobUtils'

// GET: Fetch active jobs from Supabase
export async function GET() {
  try {
    console.log('🔍 Fetching active jobs from Supabase...')

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch jobs from database',
          jobs: [],
          count: 0
        },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully fetched ${jobs?.length || 0} active jobs`)

    // Map Supabase rows to JobData format
    const mappedJobs = (jobs as SupabaseJobRow[]).map(mapSupabaseJobToJobData)

    return NextResponse.json({
      jobs: mappedJobs,
      count: mappedJobs.length,
      lastUpdated: new Date().toISOString(),
      source: 'supabase'
    })

  } catch (error) {
    console.error('💥 Error fetching jobs:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch jobs data',
        jobs: [],
        count: 0
      },
      { status: 500 }
    )
  }
}

// POST: Trigger job refresh (for backward compatibility, but now just re-fetches from Supabase)
export async function POST() {
  try {
    console.log('🔄 Manual refresh requested - fetching from Supabase...')

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error during refresh:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to refresh jobs from database'
        },
        { status: 500 }
      )
    }

    const mappedJobs = (jobs as SupabaseJobRow[]).map(mapSupabaseJobToJobData)

    console.log(`✅ Refresh successful - ${mappedJobs.length} active jobs found`)

    return NextResponse.json({
      success: true,
      message: 'Jobs refreshed from Supabase',
      count: mappedJobs.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Error refreshing jobs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh jobs'
      },
      { status: 500 }
    )
  }
}