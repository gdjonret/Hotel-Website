# BookNow Page - CMS Integration Guide

## Overview
This guide shows how to integrate the CMS-managed room type images and descriptions into the BookNow page.

---

## Current Issues

1. **Hardcoded Images:** Lines 157-158 use static images (`room-1.jpg`, `room2.jpg`)
2. **No Image Carousel:** Each room shows only 1 image, no gallery
3. **Random Photo Count:** Line 160 shows fake photo count
4. **No Descriptions:** Room descriptions from CMS not displayed

---

## Solution: Update BookNow.ejs

### Step 1: Update Room Card Image Section

**Replace lines 156-170** with this dynamic image carousel:

```html
<div class="room-image room-card-carousel" data-room-id="<%= roomType.id %>">
    <% 
    // Get images from room type (from CMS)
    const roomImages = roomType.images && roomType.images.length > 0 
        ? roomType.images 
        : ['/images/room-1.jpg']; // Fallback to default
    const photoCount = roomImages.length;
    %>
    
    <!-- Carousel for multiple images -->
    <div id="roomCarousel<%= roomType.id %>" class="carousel slide" data-bs-ride="false">
        <div class="carousel-inner">
            <% roomImages.forEach((imageUrl, imgIndex) => { %>
                <div class="carousel-item <%= imgIndex === 0 ? 'active' : '' %>">
                    <img src="<%= imageUrl %>" alt="<%= roomType.name %>" class="img-fluid rounded">
                </div>
            <% }); %>
        </div>
        
        <!-- Carousel Controls (only show if multiple images) -->
        <% if (roomImages.length > 1) { %>
            <button class="carousel-control-prev" type="button" data-bs-target="#roomCarousel<%= roomType.id %>" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#roomCarousel<%= roomType.id %>" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        <% } %>
    </div>
    
    <!-- Price Overlay -->
    <div class="price-overlay"><%= Number(roomType.baseRate).toLocaleString() %> FCFA/night</div>
    
    <!-- Photo Count Badge (real count from CMS) -->
    <div class="photo-count-badge">
        <i class="fas fa-camera"></i> <%= photoCount %>
    </div>
</div>
```

### Step 2: Add Room Description

**After line 188** (after the price line), add:

```html
<!-- Room Description from CMS -->
<% if (roomType.description) { %>
    <div class="room-description mt-3" style="padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #2c3e50;">
        <p style="margin: 0; font-size: 14px; color: #495057; line-height: 1.6;">
            <%= roomType.description.substring(0, 150) %><%= roomType.description.length > 150 ? '...' : '' %>
        </p>
    </div>
<% } %>
```

### Step 3: Update Modal Image Carousel

**Replace the modal carousel section (lines 258-270)** with:

```html
<!-- Image Carousel -->
<div id="roomImageCarousel" class="carousel slide" data-bs-ride="false">
    <div class="carousel-inner" id="carouselImages">
        <!-- Images will be dynamically inserted here -->
    </div>
    <% if (roomImages && roomImages.length > 1) { %>
        <button class="carousel-control-prev" type="button" data-bs-target="#roomImageCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#roomImageCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    <% } %>
</div>

<!-- Full Room Description -->
<div class="modal-room-description mt-3" id="modalDescription">
    <!-- Description will be inserted via JavaScript -->
</div>
```

### Step 4: Update JavaScript to Load Modal Images

**Add to `/js/pages/bookNow.js`** (or create if doesn't exist):

```javascript
// Handle "More Details" link click
document.querySelectorAll('.more-details-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const roomTypeId = this.dataset.roomTypeId;
        const roomName = this.dataset.roomName;
        const capacity = this.dataset.capacity;
        const equipment = JSON.parse(this.dataset.equipment || '[]');
        const amenities = JSON.parse(this.dataset.amenities || '[]');
        const price = this.dataset.price;
        const description = this.dataset.description || '';
        const images = JSON.parse(this.dataset.images || '[]');
        
        // Update modal title
        document.getElementById('modalRoomName').textContent = roomName;
        
        // Load images into carousel
        const carouselImages = document.getElementById('carouselImages');
        carouselImages.innerHTML = '';
        
        if (images && images.length > 0) {
            images.forEach((imageUrl, index) => {
                const carouselItem = document.createElement('div');
                carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                carouselItem.innerHTML = `
                    <img src="${imageUrl}" class="d-block w-100" alt="${roomName}" style="max-height: 400px; object-fit: cover; border-radius: 8px;">
                `;
                carouselImages.appendChild(carouselItem);
            });
        } else {
            // Fallback image
            carouselImages.innerHTML = `
                <div class="carousel-item active">
                    <img src="/images/room-1.jpg" class="d-block w-100" alt="${roomName}" style="max-height: 400px; object-fit: cover; border-radius: 8px;">
                </div>
            `;
        }
        
        // Update description
        const modalDescription = document.getElementById('modalDescription');
        if (description) {
            modalDescription.innerHTML = `
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                    <h5 style="margin-bottom: 10px; color: #2c3e50;">About This Room</h5>
                    <p style="margin: 0; color: #495057; line-height: 1.8;">${description}</p>
                </div>
            `;
        }
        
        // Update other modal content
        document.getElementById('modalSleeps').textContent = `Sleeps ${capacity} guest${capacity > 1 ? 's' : ''}`;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('roomDetailsModal'));
        modal.show();
    });
});
```

### Step 5: Update "More Details" Link Data Attributes

**Update line 174** to include images and description:

```html
<a href="#" class="more-details-link" 
   data-room-type-id="<%= roomType.id %>" 
   data-room-name="<%= roomType.name %>" 
   data-capacity="<%= roomType.capacity %>" 
   data-equipment='<%= JSON.stringify(equipment) %>' 
   data-amenities='<%= JSON.stringify(amenities) %>' 
   data-price="<%= roomType.baseRate %>"
   data-description="<%= roomType.description || '' %>"
   data-images='<%= JSON.stringify(roomType.images || []) %>'>
    More details <i class="fas fa-chevron-right"></i>
</a>
```

---

## Backend Requirements

Ensure your backend API returns room types with these fields:

```json
{
  "id": 1,
  "name": "DELUXE SINGLE",
  "capacity": 2,
  "baseRate": 25000,
  "amenitiesJson": "{\"equipment\":[...],\"amenities\":[...]}",
  "images": [
    "/uploads/room-types/abc123.jpg",
    "/uploads/room-types/def456.jpg",
    "/uploads/room-types/ghi789.jpg"
  ],
  "description": "Spacious deluxe room with modern amenities...",
  "featuredImage": "/uploads/room-types/abc123.jpg",
  "active": true
}
```

---

## CSS Enhancements

Add to `/css/BookNow.css`:

```css
/* Room Card Carousel Styling */
.room-card-carousel {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
}

.room-card-carousel .carousel-item img {
    height: 300px;
    object-fit: cover;
    width: 100%;
}

.room-card-carousel .carousel-control-prev,
.room-card-carousel .carousel-control-next {
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.3s;
}

.room-card-carousel:hover .carousel-control-prev,
.room-card-carousel:hover .carousel-control-next {
    opacity: 1;
}

.room-card-carousel .carousel-control-prev {
    left: 10px;
}

.room-card-carousel .carousel-control-next {
    right: 10px;
}

/* Room Description Styling */
.room-description {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Modal Image Carousel */
#roomImageCarousel .carousel-item img {
    max-height: 500px;
    object-fit: cover;
}

/* Photo Count Badge */
.photo-count-badge {
    position: absolute;
    bottom: 15px;
    left: 15px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 10;
}

.photo-count-badge i {
    font-size: 14px;
}
```

---

## Testing Checklist

After implementing these changes:

1. [ ] Room cards show images from CMS
2. [ ] Image carousel works (left/right arrows)
3. [ ] Photo count shows actual number of images
4. [ ] Room descriptions display correctly
5. [ ] "More Details" modal shows all images
6. [ ] Modal shows full description
7. [ ] Fallback images work when no CMS images
8. [ ] Responsive design works on mobile

---

## Benefits

✅ **Dynamic Content:** All room data comes from CMS  
✅ **Image Galleries:** Multiple images per room type  
✅ **Better UX:** Customers see actual room photos  
✅ **Easy Updates:** Owner can change images anytime  
✅ **Professional Look:** Matches modern hotel booking sites  
✅ **SEO Friendly:** Real descriptions improve search rankings  

---

## Summary

This integration connects your BookNow page with the CMS system, allowing:

1. **Admin uploads images** → Stored in database
2. **BookNow page fetches data** → Shows real images
3. **Customers see galleries** → Better booking experience
4. **Owner updates anytime** → Changes reflect immediately

The page will look like professional hotel booking sites (Booking.com, Airbnb) with image carousels and detailed room information!
