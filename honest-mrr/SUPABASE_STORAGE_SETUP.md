# Supabase Storage Setup Guide

Complete guide to setting up Supabase Storage for screenshot uploads.

---

## Step 1: Create Storage Bucket

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **New Bucket**
5. Set:
   - **Name**: `screenshots`
   - **Public bucket**: ✅ **Checked** (screenshots are public by default)
   - **File size limit**: 5 MB (screenshots are ~100-500 KB)
   - **Allowed MIME types**: `image/png`
6. Click **Create Bucket**

---

## Step 2: Configure Storage Policies

By default, public buckets allow anyone to read files. We need to add policies for upload/delete.

### Allow Authenticated Users to Upload

1. In **Storage** → **Policies** tab for `screenshots` bucket
2. Click **New Policy**
3. Select **For full customization**
4. Set:
   - **Policy name**: `Allow authenticated users to upload screenshots`
   - **Allowed operation**: `INSERT`
   - **Policy definition**:
     ```sql
     (auth.uid() = (storage.foldername(name))[1]::uuid)
     ```
   This ensures users can only upload to their own folder (e.g., `user_id/screenshot_id.png`)

5. Click **Save**

### Allow Users to Delete Own Screenshots

1. Click **New Policy** again
2. Set:
   - **Policy name**: `Allow users to delete own screenshots`
   - **Allowed operation**: `DELETE`
   - **Policy definition**:
     ```sql
     (auth.uid() = (storage.foldername(name))[1]::uuid)
     ```

3. Click **Save**

---

## Step 3: Test Storage Upload

Run this test in your terminal:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Test upload
curl -X POST \
  'https://your-project-ref.supabase.co/storage/v1/object/screenshots/test.png' \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: image/png" \
  --data-binary @test-image.png
```

You should see a success response with the file path.

---

## Step 4: Verify Public URL Access

After uploading, get the public URL:

```
https://your-project-ref.supabase.co/storage/v1/object/public/screenshots/user_id/screenshot_id.png
```

Open this URL in a browser — you should see the image.

---

## Storage Structure

Screenshots are organized by user ID:

```
screenshots/
├── user_123/
│   ├── verification_456.png
│   └── verification_789.png
├── user_abc/
│   └── verification_def.png
```

This ensures:
- Easy user-based access control
- Clean organization
- Simple deletion (delete user folder = delete all their screenshots)

---

## Security Best Practices

✅ **Public bucket** — Screenshots are public by default (shareable links)  
✅ **Upload policies** — Only authenticated users can upload  
✅ **Folder-based isolation** — Users can only upload/delete in their own folder  
✅ **File size limits** — 5 MB max prevents abuse  
✅ **MIME type restrictions** — Only PNG images allowed

---

## Storage Limits (Free Tier)

- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File uploads**: Unlimited

**Estimated usage:**
- Average screenshot: 200 KB
- 1 GB storage = ~5,000 screenshots
- 2 GB bandwidth = ~10,000 downloads/month

**When to upgrade:**
- If you hit 1 GB storage (5,000+ screenshots)
- If downloads exceed 2 GB/month (10,000+ downloads)

**Pro Tier** ($25/mo):
- 100 GB storage
- 200 GB bandwidth

---

## Troubleshooting

**"Row Level Security policy violation" error**
→ Ensure user is authenticated: `auth.uid()` should return user ID  
→ Check policy allows `INSERT` for authenticated users

**"Bucket not found" error**
→ Verify bucket name is `screenshots` (lowercase, plural)  
→ Check bucket exists in Supabase dashboard

**"File too large" error**
→ Screenshots should be ~200-500 KB  
→ Check Puppeteer PNG compression settings

**Public URL returns 404**
→ Ensure bucket is set to **Public**  
→ Verify file exists in Storage browser

---

## Cleanup (Optional)

To delete old screenshots and free up storage:

```sql
-- Delete screenshots older than 90 days
DELETE FROM screenshots
WHERE created_at < NOW() - INTERVAL '90 days';

-- Then delete files from storage
-- (This must be done via Supabase client or API)
```

You can run this as a cron job to automatically clean up old screenshots.

---

## Next Steps

Once storage is configured:

1. Test screenshot generation API: `POST /api/screenshots/generate`
2. Verify upload to Supabase Storage
3. Check public URL is accessible
4. Test download API: `GET /api/screenshots/download/{id}`

---

**Questions?** Check `BUILD_STATUS.md` for implementation roadmap.
