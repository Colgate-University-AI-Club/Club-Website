# Resources Page Management Guide

This guide explains how to add, update, and manage resources on the Resources page.

## Quick Start

### Method 1: Using the Helper Script (Easiest)

```bash
# Add a new resource interactively
node scripts/update-resources.js add

# List all current resources
node scripts/update-resources.js list

# Clear all sample data to start fresh
node scripts/update-resources.js clear
```

### Method 2: Manual JSON Editing

Edit `app/data/resources.json` directly. Each resource follows this structure:

```json
{
  "id": "res-001",
  "title": "Your Resource Title",
  "description": "Detailed description of the resource",
  "category": "presentation",  // Options: presentation, document, video, template, dataset, code, other
  "tags": ["machine learning", "python", "tutorial"],
  "fileType": "pdf",  // File extension: pdf, pptx, youtube, py, ipynb, etc.
  "fileSize": "3.2 MB",  // Optional for YouTube videos
  "downloadUrl": "https://raw.githubusercontent.com/...",  // For downloadable files
  "embedUrl": "https://www.youtube.com/watch?v=...",  // For YouTube videos
  "author": "Dr. Smith",  // Optional
  "course": "COSC 290",  // Optional
  "uploadedAt": "2024-11-07T10:00:00Z"
}
```

## Setting Up File Storage

### Step 1: Prepare Your GitHub Repository

1. Go to https://github.com/Colgate-University-AI-Club/Club-Resources
2. Create folders for your resource types:
   ```
   /presentations
   /documents
   /templates
   /datasets
   /code
   /videos
   ```

3. Upload your files to the appropriate folders

### Step 2: Get the Raw URLs

For each file in GitHub:
1. Click on the file
2. Click "Raw" button
3. Copy the URL (it should start with `https://raw.githubusercontent.com/...`)

## Resource Types & Examples

### 1. PDF Presentation
```json
{
  "id": "res-ml-intro",
  "title": "Introduction to Machine Learning",
  "description": "Comprehensive slides covering ML fundamentals",
  "category": "presentation",
  "tags": ["machine learning", "introduction", "algorithms"],
  "fileType": "pdf",
  "fileSize": "3.2 MB",
  "downloadUrl": "https://raw.githubusercontent.com/Colgate-University-AI-Club/Club-Resources/main/presentations/ml-intro.pdf",
  "author": "Prof. Johnson",
  "course": "COSC 290",
  "uploadedAt": "2024-11-01T10:00:00Z"
}
```

### 2. YouTube Video
```json
{
  "id": "res-neural-nets",
  "title": "Neural Networks Explained",
  "description": "Visual explanation of how neural networks work",
  "category": "video",
  "tags": ["neural networks", "deep learning", "tutorial"],
  "fileType": "youtube",
  "embedUrl": "https://www.youtube.com/watch?v=aircAruvnKk",
  "author": "3Blue1Brown",
  "uploadedAt": "2024-10-28T14:30:00Z"
}
```

### 3. Code Template
```json
{
  "id": "res-python-template",
  "title": "Python ML Project Template",
  "description": "Starter template for ML projects",
  "category": "template",
  "tags": ["python", "template", "project structure"],
  "fileType": "zip",
  "fileSize": "156 KB",
  "downloadUrl": "https://raw.githubusercontent.com/Colgate-University-AI-Club/Club-Resources/main/templates/ml-template.zip",
  "uploadedAt": "2024-10-25T09:15:00Z"
}
```

### 4. Dataset
```json
{
  "id": "res-tweets",
  "title": "Sentiment Analysis Dataset",
  "description": "10,000 labeled tweets for sentiment analysis",
  "category": "dataset",
  "tags": ["nlp", "sentiment", "twitter", "dataset"],
  "fileType": "csv",
  "fileSize": "5.4 MB",
  "downloadUrl": "https://raw.githubusercontent.com/Colgate-University-AI-Club/Club-Resources/main/datasets/tweets.csv",
  "uploadedAt": "2024-10-20T11:00:00Z"
}
```

### 5. Google Colab Notebook
```json
{
  "id": "res-colab-intro",
  "title": "Intro to PyTorch in Colab",
  "description": "Interactive notebook for learning PyTorch",
  "category": "code",
  "tags": ["pytorch", "colab", "tutorial", "interactive"],
  "fileType": "colab",
  "embedUrl": "https://colab.research.google.com/drive/1a2b3c4d5e6f...",
  "author": "AI Club",
  "uploadedAt": "2024-10-15T16:00:00Z"
}
```

## Bulk Import from Existing Sources

### From Google Drive (Manual Process)

1. Download files from Google Drive
2. Upload to GitHub repository
3. Create resource entries using the script:
   ```bash
   node scripts/update-resources.js add
   ```

### From a Spreadsheet

If you have resources in a spreadsheet:

1. Export as CSV
2. Create a quick conversion script (example):

```javascript
const csv = require('csv-parse/sync');
const fs = require('fs');

const csvData = fs.readFileSync('resources.csv', 'utf8');
const records = csv.parse(csvData, { columns: true });

const resources = records.map(row => ({
  id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: row.Title,
  description: row.Description,
  category: row.Category.toLowerCase(),
  tags: row.Tags.split(',').map(t => t.trim()),
  fileType: row.FileType,
  downloadUrl: row.URL,
  author: row.Author,
  uploadedAt: new Date().toISOString()
}));

const data = {
  lastUpdated: new Date().toISOString(),
  resources
};

fs.writeFileSync('app/data/resources.json', JSON.stringify(data, null, 2));
```

## Best Practices

### File Organization
- Keep files under 50MB (GitHub limit for web interface)
- Use descriptive file names: `ml-intro-2024.pdf` not `document1.pdf`
- Organize by type in GitHub repository

### Metadata Guidelines
- **Title**: Clear, concise, searchable (e.g., "Neural Networks Introduction" not "Lecture 5")
- **Description**: 1-2 sentences explaining what users will learn/find
- **Tags**: 3-5 relevant keywords for filtering
- **Category**: Choose the most appropriate single category
- **Author**: Credit the creator
- **Course**: Include if relevant (helps students find course materials)

### Maintenance
- Regularly check for broken links
- Update file sizes if files are replaced
- Remove outdated resources
- Keep total resources manageable (consider archiving old ones)

## Troubleshooting

### Resource Not Appearing
1. Check JSON syntax is valid (no trailing commas, proper quotes)
2. Ensure unique ID
3. Verify required fields: id, title, description, category, uploadedAt

### Download Not Working
1. Check GitHub file is public
2. Verify raw URL format
3. Ensure file exists in repository

### Video Not Embedding
1. Use standard YouTube watch URLs
2. Ensure video is not private
3. Check embedUrl field is present

## Advanced Features

### Adding External Links
For resources hosted elsewhere (not GitHub):
```json
{
  "downloadUrl": "https://arxiv.org/pdf/2301.00001.pdf",
  "fileType": "pdf",
  "fileSize": "External"
}
```

### Adding Preview Images
```json
{
  "thumbnail": "/images/resources/ml-intro-preview.png"
}
```
Place preview images in `public/images/resources/`

### Tracking Downloads
Add to resource:
```json
{
  "downloads": 0,
  "views": 0
}
```
(Requires implementing analytics tracking)

## Examples Commands

```bash
# Clear sample data and start fresh
node scripts/update-resources.js clear

# Add your first real resource
node scripts/update-resources.js add
# Follow the prompts to enter resource details

# Check what resources you have
node scripts/update-resources.js list

# After adding resources, rebuild to see changes
npm run build

# View at http://localhost:3001/resources
npm run dev
```

## Need Help?

1. Check the JSON is valid: https://jsonlint.com/
2. View browser console for errors
3. Check Network tab for failed downloads
4. Ensure GitHub repository is public