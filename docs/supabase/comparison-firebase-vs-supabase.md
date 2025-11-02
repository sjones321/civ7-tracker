# Firebase vs Supabase Comparison

## Quick Summary

For CIV7 Tracker (2 users, ~200 operations/day, small data):

- **Winner: Supabase** ✅
- **Reason:** SQL skills are valuable, free tier is sufficient, perfect for structured data

## Detailed Comparison

### Firebase Firestore

**Free Tier Limits:**

- 1GB storage
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- Real-time listeners: 50,000 per day

**Pros:**

- Very beginner-friendly setup (15 minutes)
- More generous storage (1GB vs 500MB)
- Built-in real-time sync
- Excellent documentation
- Google-backed reliability
- NoSQL = flexible schemas

**Cons:**

- Vendor lock-in (Google ecosystem)
- NoSQL (learns document storage, not transferable SQL)
- Costs can grow unpredictably with usage spikes
- Less structured queries (compared to SQL)

**Pricing After Free Tier:**

- ~$0.18/GB storage
- ~$0.06 per 100K reads
- ~$0.18 per 100K writes

**Best For:**

- Quick prototypes
- Real-time heavy apps
- When you want zero SQL learning curve

---

### Supabase

**Free Tier Limits:**

- 500MB database storage
- 2GB bandwidth/month
- 2 million API requests/month
- 50,000 monthly active users
- Real-time subscriptions included

**Pros:**

- PostgreSQL (standard SQL - learn valuable skills)
- Auto-generated REST APIs (no backend code needed!)
- Open source (can self-host later)
- Real-time subscriptions included
- Better for structured relational data
- Excellent for learning databases
- Row Level Security (fine-grained permissions)
- Better suited for your entity relationships

**Cons:**

- Slightly smaller free tier (500MB vs 1GB)
- Need to understand basic SQL concepts
- Slightly more setup steps

**Pricing After Free Tier:**

- Pro plan: $25/month
- Includes: 8GB storage, 50GB bandwidth
- Still very affordable if you outgrow free tier

**Best For:**

- Learning SQL and databases
- Structured relational data (like your entities)
- Long-term projects
- Multi-site future (one account, multiple projects)

---

## CIV7 Tracker Specific Analysis

### Your Requirements

- **Users:** 2 people (Tiny + Steve)
- **Operations:** ~200/day
- **Data Size:** Few KB growing to ~200MB over years
- **Structure:** Highly relational (civs → leaders, wonders → ownership, etc.)

### Firebase Analysis

✅ 1GB storage: More than enough  
✅ 50K reads/day: You'd use ~200 = well within limits  
✅ Real-time: Nice to have, but manual refresh works  
❌ NoSQL: Your data is relational (civs have leaders, wonders have ownership history)  
❌ Less transferable skills  

### Supabase Analysis

✅ 500MB storage: Still more than enough (200MB estimated)  
✅ 2M API requests/month: ~6,000/day = plenty of headroom  
✅ SQL: Perfect for your relational data model  
✅ Learning value: SQL skills transfer everywhere  
✅ Auto-APIs: No backend code needed  
✅ Multi-site ready: Easy to add more projects later  

## Verdict

**Supabase wins for CIV7 Tracker** because:

1. Your data is relational (perfect for SQL)
2. SQL skills are valuable and transferable
3. Free tier is more than sufficient
4. Auto-generated APIs mean less code
5. Better foundation for multiple sites later
6. You're learning valuable skills while building

**Firebase would work**, but you'd be learning document storage patterns that don't transfer as well to other projects.

## Cost Comparison (Both Free!)

Both are free for your usage level:

- **Firebase:** $0/month (well within free tier)
- **Supabase:** $0/month (well within free tier)

**If you outgrow free tier:**

- **Firebase:** Pay-as-you-go (could be unpredictable)
- **Supabase:** $25/month flat (predictable, still cheap)

## Recommendation

**Choose Supabase** for:

- Structured data (you have it)
- Learning value (SQL is everywhere)
- Future scalability (one account, multiple projects)
- Auto-generated APIs (less code to write)

You can always switch later, but your data model fits SQL so well that you won't need to.
