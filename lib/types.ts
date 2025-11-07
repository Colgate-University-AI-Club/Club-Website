export type NewsItem={id:string;title:string;summary?:string;content?:string;sourceType:'club'|'external';url:string;tags?:string[];publishedAt:string};

// Legacy JobItem for backward compatibility
export type JobItem={id:string;role:string;company:string;location?:string;url:string;postedAt?:string;tags?:string[]};

// New comprehensive JobData interface for enhanced job listings
export interface JobData {
  jobKey: string;
  title: string;
  companyName: string | null;
  jobType: string[]; // e.g., ["Full-time"], ["Internship"], etc.
  descriptionText: string; // markdown format
  companyUrl: string | null;
  location: {
    city: string;
    postalCode: string | null;
    country: string;
    countryCode: string;
    formattedAddressLong: string;
    formattedAddressShort: string;
    latitude: number;
    longitude: number;
    streetAddress: string | null;
    fullAddress: string;
  };
  salary: {
    salaryCurrency: string;
    salaryMax: number;
    salaryMin: number;
    salarySource: string;
    salaryText: string; // e.g., "$175,000 - $250,000 a year"
    salaryType: string; // "yearly", "hourly"
  };
  benefits: string[]; // e.g., ["Health insurance", "Unlimited paid time off"]
  attributes: string[]; // various job attributes/skills
  jobUrl: string;
  applyUrl: string;
  requirements: Array<{
    label: string;
    requirementSeverity: "REQUIRED" | "PREFERRED";
  }>;
  jobCardSummary: string; // summary for the card display
  postedAt?: string; // for compatibility with existing sorting
}

export type EventItem={id:string;title:string;startsAt:string;endsAt?:string;location?:string;description?:string;rsvpUrl?:string;calendarEventId?:string};

// Google Calendar API types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
}

export interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
}

// GitHub repository statistics interface
export interface GitHubRepoStats {
  stars: number;
  forks: number;
  lastUpdated: string;
  contributors: number;
  language: string | null;
  isArchived: boolean;
}

export type ProjectItem={id:string;slug:string;title:string;level:'beginner'|'intermediate'|'advanced';projectType:'code'|'no-code'|'hybrid';tools:string[];durationHours?:number;summary:string;repoUrl?:string;workflowUrl?:string;resources?:{label:string;url:string}[];body?:string;githubStats?:GitHubRepoStats};
export type NewsletterItem={id:number;title:string;content_markdown:string;publish_date:string;};

// Supabase jobs table structure
export interface SupabaseJobRow {
  job_key: string;
  title: string;
  company_name: string | null;
  job_type: string[] | null;
  benefits: string[] | null;
  attributes: string[] | null;
  description_text: string;
  job_card_summary: string;
  company_url: string | null;
  job_url: string;
  apply_url: string;
  location_city: string;
  location_postal_code: string | null;
  location_country: string;
  location_country_code: string;
  location_full_address: string;
  salary_currency: string;
  salary_max: number | null;
  salary_min: number | null;
  salary_text: string;
  salary_type: string;
  requirements: Array<{
    label: string;
    requirementSeverity: "REQUIRED" | "PREFERRED";
  }> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Resource types for the Resources page
export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  tags: string[];
  fileType: string; // Extension: pdf, pptx, py, ipynb, etc.
  fileSize?: string; // Human readable: "2.3 MB"
  downloadUrl?: string; // GitHub raw URL for files
  embedUrl?: string; // YouTube/external embeds
  githubPath?: string; // Path in club-resources repo
  thumbnail?: string; // Preview image URL
  author?: string;
  course?: string; // Associated course if applicable
  uploadedAt: string;
  lastModified?: string;
  downloads?: number;
  views?: number;
  source?: 'manual' | 'google-drive'; // Track source of resource
}

export type ResourceCategory =
  | 'presentation'
  | 'document'
  | 'video'
  | 'template'
  | 'dataset'
  | 'code'
  | 'other';
