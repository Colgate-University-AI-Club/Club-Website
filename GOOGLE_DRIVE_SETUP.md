# Google Drive Integration Setup Guide

This guide explains how to set up Google Drive integration for automatic resource syncing.

## Overview

The Google Drive integration allows you to:
- Upload files to a Google Drive folder
- Click "Sync from Google Drive" button on the Resources page
- Automatically import all files as resources with smart categorization
- Keep manual resources while syncing Drive resources

## Prerequisites

1. Google Cloud Console account
2. A Google Drive folder for resources
3. Access to environment variables (local `.env.local` or Vercel dashboard)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project" or select an existing project
3. Name it (e.g., "Colgate AI Club Resources")
4. Note the Project ID

## Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in details:
   - Service account name: `resources-sync`
   - Service account ID: `resources-sync`
   - Description: "Syncs resources from Google Drive"
4. Click "Create and Continue"
5. Skip optional permissions (click "Continue")
6. Click "Done"

## Step 4: Generate Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. **Save the downloaded JSON file securely**

## Step 5: Set Up Google Drive Folder

1. Create a folder in Google Drive for resources
2. Right-click the folder > "Share"
3. Add the service account email (found in the JSON file as `client_email`)
   - Example: `resources-sync@your-project.iam.gserviceaccount.com`
4. Give "Viewer" permission
5. Click "Send"

## Step 6: Get Folder ID

1. Open the Google Drive folder in your browser
2. Look at the URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`
3. Copy the FOLDER_ID part

## Step 7: Configure Environment Variables

### For Local Development

Add to `.env.local`:

```bash
# Google Drive Integration
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
GOOGLE_SERVICE_ACCOUNT_KEY='{paste entire JSON content here as single line}'
```

**Important:** The JSON must be on a single line. You can use this tool to convert:
```javascript
// In browser console or Node.js:
console.log(JSON.stringify(yourJsonObject))
```

### For Production (Vercel)

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add two variables:
   - `GOOGLE_DRIVE_FOLDER_ID`: Your folder ID
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: The entire JSON as a string

## Step 8: Organize Your Files

Structure your Google Drive folder:
```
Resources Folder/
├── Presentations/
│   ├── ML_Introduction_2024.pdf
│   └── Neural_Networks_Workshop.pptx
├── Documents/
│   ├── AI_Ethics_Paper.pdf
│   └── Research_Guidelines.docx
├── Templates/
│   ├── Python_ML_Template.zip
│   └── Jupyter_Starter.ipynb
├── Datasets/
│   ├── Twitter_Sentiment.csv
│   └── Stock_Prices_2024.json
└── Videos/
    └── Tutorial_Recording.mp4
```

## Step 9: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3001/resources

3. Click "Sync from Google Drive" button

4. Check for success message

## File Naming Best Practices

For better auto-categorization and tagging:

1. **Use descriptive names:**
   - Good: `Machine_Learning_Introduction_COSC290_2024.pdf`
   - Bad: `lecture1.pdf`

2. **Include keywords for auto-tagging:**
   - `python`, `ml`, `ai`, `tutorial`, `beginner`, `advanced`
   - Course codes: `COSC290`, `COSC480`
   - Years: `2024`, `2025`

3. **Category indicators:**
   - Presentations: Include "slides" or "presentation"
   - Templates: Include "template"
   - Datasets: Include "dataset" or "data"

## How It Works

1. **Sync Process:**
   - Fetches all files from Google Drive folder
   - Determines category based on file type and name
   - Extracts tags from filename
   - Generates description if none exists
   - Merges with existing manual resources

2. **Auto-Categorization:**
   - `.pptx`, `.ppt` → Presentation
   - `.pdf`, `.docx` → Document
   - `.mp4`, `.mov` → Video
   - `.zip`, templates → Template
   - `.csv`, `.json`, datasets → Dataset
   - `.py`, `.ipynb` → Code

3. **Resource Storage:**
   - Drive resources marked with `source: 'google-drive'`
   - Manual resources preserved with `source: 'manual'`
   - All stored in `app/data/resources.json`

## Troubleshooting

### "Google Drive configuration missing"
- Ensure both environment variables are set
- Restart dev server after adding variables

### "Service account authentication failed"
- Check JSON format (must be valid JSON)
- Ensure it's on a single line in `.env.local`
- Verify service account has correct permissions

### "Google Drive folder not found"
- Check folder ID is correct
- Ensure service account has access to folder
- Folder must be shared with service account email

### "No files synced"
- Check folder has files
- Files must not be in trash
- Service account needs at least "Viewer" permission

## Security Notes

1. **Never commit** the service account key to Git
2. Add `.env.local` to `.gitignore`
3. Use environment variables in production
4. Service account should have minimal permissions (Viewer only)
5. Rate limiting prevents abuse (1 sync per minute)

## Advanced Features

### Filtering by Subfolder
To sync only specific subfolders, modify the API query:
```typescript
// In route.ts, modify the query:
q: `'${SUBFOLDER_ID}' in parents and trashed = false`
```

### Custom Metadata
Add descriptions to files in Google Drive:
1. Right-click file > "File information"
2. Add description
3. It will be imported during sync

### Automatic Syncing
For automatic syncing every hour:
1. Create a cron job in Vercel
2. Call the sync endpoint periodically
3. Or use GitHub Actions scheduled workflow

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Next.js terminal for server errors
3. Verify all environment variables
4. Test with a simple folder first
5. Ensure file sizes are reasonable (<100MB recommended)

---

*For manual resource management, see RESOURCES_GUIDE.md*