# Fix: Make Homepage Room Images Dynamic

## Problem
Homepage room cards show hardcoded images that don't sync with Admin Platform updates.

## Current Code (Hardcoded)
```html
<!-- views/pages/index.ejs lines 334 & 348 -->
<img src="/images/rooms/Deluxe/room5.png" alt="Deluxe Single room interior">
<img src="/images/rooms/Standard/room2.png" alt="Standard Single room interior">
```

## Solution: Fetch from Backend API

### Step 1: Update Route to Fetch Room Types

**File:** `src/routes/pages.js`

Add this before the index route:

```javascript
// Home page route - fetch room types for display
router.get("/", async (req, res) => {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
        
        // Fetch room types from backend
        const response = await axios.get(`${backendUrl}/api/public/room-types`);
        const allRoomTypes = response.data;
        
        // Get only active room types, sorted by sortOrder
        const featuredRooms = allRoomTypes
            .filter(rt => rt.active)
            .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
            .slice(0, 2); // Get first 2 for homepage
        
        res.render("pages/index", { featuredRooms });
    } catch (error) {
        console.error('Error fetching room types for homepage:', error.message);
        // Fallback to empty array if backend is down
        res.render("pages/index", { featuredRooms: [] });
    }
});
```

### Step 2: Update Homepage Template

**File:** `views/pages/index.ejs`

Replace lines 328-358 with:

```html
<div class="content mtop">
  <div class="owl-carousel owl-carousel1 owl-theme">
    <% if (typeof featuredRooms !== 'undefined' && featuredRooms.length > 0) { %>
      <% featuredRooms.forEach(room => { 
        // Get featured image or first image from array
        let roomImage = room.featuredImage;
        if (!roomImage && room.images && room.images.length > 0) {
          roomImage = room.images[0];
        }
        // Fallback to default image
        if (!roomImage) {
          roomImage = '/images/room-1.jpg';
        }
      %>
        <div class="item-wrap">
          <h3 class="room-card-title"><%= room.name %></h3>
          <div class="item">
            <div class="image">
              <img src="<%= roomImage %>" 
                   alt="<%= room.name %> interior" 
                   loading="lazy">
            </div>
            <div class="text">
              <div class="button flex">
                <a href="/BookNow">
                  <button class="primary-btn">Réserver</button>
                </a>
                <h3><%= Number(room.baseRate).toLocaleString() %> FCFA
                  <span><br> / nuit</span>
                </h3>
              </div>
            </div>
          </div>
        </div>
      <% }); %>
    <% } else { %>
      <!-- Fallback: Show hardcoded rooms if backend unavailable -->
      <div class="item-wrap">
        <h3 class="room-card-title">Deluxe Single</h3>
        <div class="item">
          <div class="image">
            <img src="/images/rooms/Deluxe/room5.png" 
                 alt="Deluxe Single room interior" 
                 loading="lazy">
          </div>
          <div class="text">
            <div class="button flex">
              <a href="/BookNow">
                <button class="primary-btn">Réserver</button>
              </a>
              <h3>25 000 FCFA<span><br> / nuit</span></h3>
            </div>
          </div>
        </div>
      </div>
      <div class="item-wrap">
        <h3 class="room-card-title">Standard Single</h3>
        <div class="item">
          <div class="image">
            <img src="/images/rooms/Standard/room2.png" 
                 alt="Standard Single room interior" 
                 loading="lazy">
          </div>
          <div class="text">
            <div class="button flex">
              <a href="/BookNow">
                <button class="primary-btn">Réserver</button>
              </a>
              <h3>20 000 FCFA<span><br> / nuit</span></h3>
            </div>
          </div>
        </div>
      </div>
    <% } %>
  </div>
</div>
```

### Step 3: Import axios if not already

**File:** `src/routes/pages.js` (top of file)

```javascript
const axios = require('axios');
```

## Benefits

✅ **Single Source of Truth** - Images managed only in Admin Platform  
✅ **Automatic Updates** - Change once, updates everywhere  
✅ **Dynamic Pricing** - Homepage shows current prices  
✅ **Fallback Support** - Still works if backend is down  
✅ **Easy Maintenance** - No need to edit code for image changes  

## Testing

1. **Update image in Admin Platform**
2. **Refresh homepage** - Should show new image
3. **Check BookNow page** - Should also show new image
4. **Check admin-room-types** - Should show new image

All three places now sync automatically!

## Alternative: Quick Fix (Temporary)

If you just want to change the hardcoded images temporarily:

**File:** `views/pages/index.ejs`

```html
<!-- Line 334 - Change to your new image -->
<img src="/images/rooms/Deluxe/YOUR-NEW-IMAGE.png" alt="Deluxe Single room interior" loading="lazy">

<!-- Line 348 - Change to your new image -->
<img src="/images/rooms/Standard/YOUR-NEW-IMAGE.png" alt="Standard Single room interior" loading="lazy">
```

⚠️ **Warning:** This won't sync with Admin Platform. You'll need to update in 3 places:
1. Homepage (index.ejs)
2. BookNow page (BookNow.ejs fallback)
3. Admin Platform database

## Recommendation

Use the **dynamic solution** (Steps 1-3) for long-term maintainability!
