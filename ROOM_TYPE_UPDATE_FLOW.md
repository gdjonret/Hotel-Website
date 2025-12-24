# Room Type Update Flow Analysis

## 🔍 Current Architecture

Your system has **3 separate applications**:

### 1. **Admin Platform** (Documents/Admin-platform)
- **Purpose:** CMS for managing room types
- **Updates:** Room types, images, descriptions, prices
- **Database:** Writes to Backend database

### 2. **Backend** (Desktop/Backend-Hotel 2)
- **Purpose:** API server and database
- **Database:** PostgreSQL/MySQL (stores room types)
- **API Endpoints:**
  - `GET /api/public/room-types` - Fetch all room types
  - `POST /api/admin/room-types` - Create room type
  - `PUT /api/admin/room-types/:id` - Update room type
  - `DELETE /api/admin/room-types/:id` - Delete room type

### 3. **Frontend/Public Website** (Documents/Hotel_process 2)
- **Purpose:** Customer-facing booking website
- **Reads from:** Backend API
- **Does NOT write:** Only displays data

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│  Admin Platform     │
│  (CMS Interface)    │
│                     │
│  - Upload images    │
│  - Edit room info   │
│  - Set prices       │
└──────────┬──────────┘
           │
           │ HTTP POST/PUT
           │ (Updates room types)
           ▼
┌─────────────────────┐
│  Backend Server     │
│  (API + Database)   │
│                     │
│  - Stores data      │
│  - Serves API       │
└──────────┬──────────┘
           │
           │ HTTP GET
           │ (Fetches room types)
           ▼
┌─────────────────────┐
│  Frontend Website   │
│  (Public Site)      │
│                     │
│  - BookNow page     │
│  - Admin view page  │
└─────────────────────┘
```

---

## ✅ Answer to Your Question

### **Where do updates go?**

When you update room types in the **Admin Platform**, the changes are saved to the **Backend database**.

### **What gets updated?**

| Component | Gets Updated? | How? |
|-----------|---------------|------|
| **Admin Platform** | ✅ YES | You make changes here |
| **Backend Database** | ✅ YES | Admin Platform writes to it |
| **Frontend Website** | ✅ YES (automatically) | Fetches fresh data from Backend API |

---

## 🔄 Update Process Step-by-Step

### Scenario: You update "Deluxe Single" room price from 25,000 to 30,000 FCFA

1. **Admin Platform (You)**
   ```
   Open Admin Platform → Edit Room Type → Change price to 30,000 → Save
   ```

2. **Backend (Automatic)**
   ```
   Receives: PUT /api/admin/room-types/1
   Body: { "baseRate": 30000 }
   
   Updates database:
   UPDATE room_types SET base_rate = 30000 WHERE id = 1;
   ```

3. **Frontend (Automatic)**
   ```
   Next time someone visits BookNow page:
   
   GET /api/public/room-types
   
   Response includes:
   {
     "id": 1,
     "name": "Deluxe Single",
     "baseRate": 30000  ← NEW PRICE!
   }
   ```

---

## 📍 Where Updates Are Stored

### Backend Database Structure

```sql
-- Room Types Table
CREATE TABLE room_types (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    code VARCHAR(50),
    capacity INT,
    base_rate DECIMAL(10,2),  ← Price stored here
    description TEXT,
    amenities_json TEXT,
    images JSON,              ← Images stored here
    featured_image VARCHAR(255),
    active BOOLEAN,
    sort_order INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Storage Location:** Backend server database (likely PostgreSQL or MySQL)

---

## 🔍 How Frontend Fetches Data

### Code Analysis from Your Frontend

#### 1. **BookNow Page** (`src/routes/pages.js` line 44-64)
```javascript
// Frontend fetches room types from Backend
const response = await axios.get(`${backendUrl}/api/public/room-types`);
roomTypes = response.data;

// Renders BookNow.ejs with fresh data
res.render("pages/BookNow", {
    roomTypes  // ← Always fresh from Backend!
});
```

#### 2. **Admin Room Types View** (`views/pages/admin-room-types.ejs` line 110)
```javascript
// Fetches from Backend API
const response = await fetch(`${API_BASE_URL}/api/public/room-types`);
const roomTypes = await response.json();
```

**Key Point:** Frontend **NEVER caches** room type data. It always fetches fresh data from Backend on every page load.

---

## ⚡ Real-Time Updates

### How fast do changes appear?

| Action | Time to Reflect |
|--------|-----------------|
| Update in Admin Platform | Immediate (saves to Backend) |
| View in Backend database | Immediate |
| View on Frontend website | **Next page load** |

**Example:**
```
10:00 AM - You change price in Admin Platform
10:00 AM - Backend database updated
10:01 AM - Customer visits BookNow page → Sees NEW price ✅
```

---

## 🔧 Configuration Check

### Your Current Setup

From `.env` file:
```env
BACKEND_URL=http://localhost:8080
```

From `admin-room-types.ejs`:
```javascript
const API_BASE_URL = '<%= process.env.BACKEND_URL || "http://localhost:8080" %>';
```

**This means:**
- Frontend connects to: `http://localhost:8080`
- Admin Platform should connect to: Same Backend URL
- All updates go to: Backend database at localhost:8080

---

## ✅ Verification Steps

### To confirm updates are working:

1. **Update a room type in Admin Platform**
   - Change price or description
   - Click Save

2. **Check Backend database directly**
   ```sql
   SELECT * FROM room_types WHERE id = 1;
   ```
   - Should show updated values

3. **Refresh Frontend BookNow page**
   - Should display new values immediately

4. **Check Admin view page**
   - Visit: `http://localhost:3000/admin-room-types`
   - Should show updated values

---

## 🚨 Common Issues

### Issue 1: Changes don't appear on Frontend
**Cause:** Frontend not connecting to correct Backend URL

**Solution:**
```bash
# Check .env file
cat .env

# Should show:
BACKEND_URL=http://localhost:8080

# Make sure Backend is running on port 8080
```

### Issue 2: Admin Platform updates don't save
**Cause:** Admin Platform not connected to Backend

**Solution:**
- Check Admin Platform's Backend URL configuration
- Ensure Backend server is running
- Check network/firewall settings

### Issue 3: Old data still showing
**Cause:** Browser cache

**Solution:**
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
Or: Clear browser cache
```

---

## 📝 Summary

### ✅ **YES, updates work correctly!**

When you update room types in the **Admin Platform**:

1. ✅ Changes are saved to **Backend database**
2. ✅ Frontend **automatically fetches** updated data
3. ✅ Customers see **new information** on next page load
4. ✅ No manual sync needed - it's automatic!

### The Flow:
```
Admin Platform → Backend Database → Frontend Website
   (You edit)      (Stores data)      (Displays data)
```

---

## 🎯 Best Practices

1. **Always update via Admin Platform** - Don't edit database directly
2. **Test after updates** - Visit BookNow page to verify changes
3. **Keep Backend running** - Frontend needs it to fetch data
4. **Use same Backend URL** - All apps should point to same Backend
5. **Check logs** - If issues occur, check Backend server logs

---

## 🔗 Related Files

- **Frontend routes:** `src/routes/pages.js`
- **Admin view:** `views/pages/admin-room-types.ejs`
- **BookNow page:** `views/pages/BookNow.ejs`
- **Config:** `.env`
- **Integration guide:** `BOOKNOW_CMS_INTEGRATION.md`

---

**Last Updated:** October 27, 2025
