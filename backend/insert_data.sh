#!/bin/bash

# Configuration
LOCAL_URL="http://localhost:5007/api"
LIVE_URL="https://meraki.aangandevelopers.com/api"
COOKIE_FILE="meraki_cookies.txt"

# Default to Local if no argument provided
TARGET_URL=$LOCAL_URL
if [ "$1" == "live" ]; then
    TARGET_URL=$LIVE_URL
    echo "🎯 Targeting LIVE site: $LIVE_URL"
else
    echo "🏠 Targeting LOCAL site: $LOCAL_URL"
fi

# Credentials
ADMIN_EMAIL="admin@meraki.com"
ADMIN_PASS="admin123"

# Images
IMG_BAGEL="https://images.unsplash.com/photo-1585476108014-9c5186c58dc6?w=500&auto=format&fit=crop"
IMG_CROISSANT="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop"
IMG_CHEESECAKE="https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop"
IMG_ESPRESSO="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop"
IMG_ICED="https://images.unsplash.com/photo-1517701604599-bb28b3650422?w=500&auto=format&fit=crop"
IMG_SANDWICH="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop"

echo "🔐 Logging in as Admin..."
curl -s -c $COOKIE_FILE -X POST "$TARGET_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"$ADMIN_EMAIL\", \"password\":\"$ADMIN_PASS\"}" > /dev/null

# Function to add Menu Item
add_menu_item() {
    local NAME=$1
    local CATEGORY=$2
    local PRICE=$3
    local DESC=$4
    local IMG=$5

    echo "🍽️ Adding: $NAME..."
    curl -s -b $COOKIE_FILE -X POST "$TARGET_URL/admin/menu/add" \
         -H "Content-Type: application/json" \
         -d "{\"name\":\"$NAME\", \"category\":\"$CATEGORY\", \"price\":$PRICE, \"description\":\"$DESC\", \"image_url\":\"$IMG\", \"is_available\":true}" > /dev/null
}

# --- MENU DATA ---
# Bagels
add_menu_item "Classic Cream Cheese" "Bagels" 250 "Classic bagel with cream cheese" "$IMG_BAGEL"
add_menu_item "Onion-Garlic Cream Cheese" "Bagels" 250 "Bagel with onion and garlic flavored cream cheese" "$IMG_BAGEL"
add_menu_item "Cream Cheese L + T" "Bagels" 250 "Bagel with cream cheese, lettuce, and tomato" "$IMG_BAGEL"
add_menu_item "Pesto Cream Cheese L + T" "Bagels" 280 "Bagel with pesto cream cheese, lettuce, and tomato" "$IMG_BAGEL"

# Croissants
add_menu_item "Butter Croissant" "Croissants" 200 "Flaky butter croissant" "$IMG_CROISSANT"
add_menu_item "Almond Croissant" "Croissants" 200 "Croissant topped with almonds" "$IMG_CROISSANT"
add_menu_item "Chocolate Croissant" "Croissants" 260 "Croissant filled with chocolate" "$IMG_CROISSANT"

# Cheesecake
add_menu_item "New York Cheesecake" "Cheesecake" 240 "Classic New York style cheesecake" "$IMG_CHEESECAKE"
add_menu_item "Blueberry Cheesecake" "Cheesecake" 260 "Cheesecake with blueberry topping" "$IMG_CHEESECAKE"
add_menu_item "Nutella Cheesecake" "Cheesecake" 280 "Cheesecake with Nutella" "$IMG_CHEESECAKE"
add_menu_item "Biscoff Cheesecake" "Cheesecake" 300 "Cheesecake with Biscoff spread" "$IMG_CHEESECAKE"

# Espresso (Hot Coffee)
add_menu_item "Espresso Shot" "Espresso (Hot Coffee)" 160 "Pure espresso shot" "$IMG_ESPRESSO"
add_menu_item "Long / Short Black" "Espresso (Hot Coffee)" 170 "Black coffee" "$IMG_ESPRESSO"
add_menu_item "Macchiato" "Espresso (Hot Coffee)" 170 "Espresso with a dollop of foam" "$IMG_ESPRESSO"
add_menu_item "Cappuccino" "Espresso (Hot Coffee)" 190 "Classic cappuccino" "$IMG_ESPRESSO"
add_menu_item "Latte" "Espresso (Hot Coffee)" 190 "Classic latte" "$IMG_ESPRESSO"
add_menu_item "Flat White" "Espresso (Hot Coffee)" 190 "Smooth flat white" "$IMG_ESPRESSO"
add_menu_item "Cortado" "Espresso (Hot Coffee)" 190 "Equal parts espresso and warm milk" "$IMG_ESPRESSO"
add_menu_item "Mocha" "Espresso (Hot Coffee)" 210 "Espresso with chocolate and milk" "$IMG_ESPRESSO"

# Iced Coffee
add_menu_item "Iced Espresso" "Iced Coffee" 170 "Espresso over ice" "$IMG_ICED"
add_menu_item "Café Bombon" "Iced Coffee" 180 "Espresso with sweetened condensed milk" "$IMG_ICED"
add_menu_item "Iced Latte" "Iced Coffee" 200 "Chilled latte" "$IMG_ICED"
add_menu_item "Iced Cappuccino" "Iced Coffee" 200 "Chilled cappuccino" "$IMG_ICED"
add_menu_item "Cold Brew" "Iced Coffee" 200 "Slow-steeped cold coffee" "$IMG_ICED"
add_menu_item "Vietnamese Coffee" "Iced Coffee" 210 "Vietnamese style iced coffee" "$IMG_ICED"
add_menu_item "Espresso Tonic" "Iced Coffee" 230 "Espresso with tonic water" "$IMG_ICED"
add_menu_item "Cold Brew Tonic" "Iced Coffee" 230 "Cold brew with tonic water" "$IMG_ICED"
add_menu_item "Iced Mocha Cortado" "Iced Coffee" 250 "Iced mocha cortado" "$IMG_ICED"
add_menu_item "Barrel Aged Cold Brew" "Iced Coffee" 260 "Special barrel aged cold brew" "$IMG_ICED"
add_menu_item "Barrel Aged Cold Brew Tonic" "Iced Coffee" 260 "Barrel aged cold brew with tonic" "$IMG_ICED"

# Food & Toasts
add_menu_item "Tomato Basil Mozzarella S/W" "Food & Toasts" 160 "Tomato, basil, and mozzarella sandwich" "$IMG_SANDWICH"
add_menu_item "Greek Pita S/W" "Food & Toasts" 210 "Greek style pita sandwich" "$IMG_SANDWICH"
add_menu_item "Forest Mushroom Melt S/W" "Food & Toasts" 210 "Mushroom melt sandwich" "$IMG_SANDWICH"
add_menu_item "Tandoori Paneer S/W" "Food & Toasts" 240 "Tandoori paneer sandwich" "$IMG_SANDWICH"
add_menu_item "Spicy Cream Cheese Sub" "Food & Toasts" 250 "Sub with spicy cream cheese" "$IMG_SANDWICH"
add_menu_item "Grinch Sourdough Open Toast" "Food & Toasts" 250 "Open sourdough toast" "$IMG_SANDWICH"
add_menu_item "Caesar Salad" "Food & Toasts" 270 "Fresh Caesar salad" "$IMG_SANDWICH"
add_menu_item "Farm Fresh Sourdough S/W" "Food & Toasts" 280 "Sourdough sandwich" "$IMG_SANDWICH"
add_menu_item "Red Alert Sourdough S/W" "Food & Toasts" 300 "Spicy sourdough sandwich" "$IMG_SANDWICH"
add_menu_item "Teriyaki Paneer S/W" "Food & Toasts" 300 "Teriyaki paneer sandwich" "$IMG_SANDWICH"
add_menu_item "Truffled Mushroom Open Toast" "Food & Toasts" 300 "Premium truffle mushroom toast" "$IMG_SANDWICH"

# --- REVIEW DATA ---
echo "📝 Submitting Reviews..."

# Function to register, login and submit review
submit_review() {
    local USER_NAME=$1
    local RATING=$2
    local COMMENT=$3
    local EMAIL=$(echo "$USER_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '.')@maps.reviewer
    local PASS="reviewer123"

    # Register
    curl -s -X POST "$TARGET_URL/auth/register" \
         -H "Content-Type: application/json" \
         -d "{\"name\":\"$USER_NAME\", \"email\":\"$EMAIL\", \"password\":\"$PASS\"}" > /dev/null

    # Login
    curl -s -c $COOKIE_FILE -X POST "$TARGET_URL/auth/login" \
         -H "Content-Type: application/json" \
         -d "{\"email\":\"$EMAIL\", \"password\":\"$PASS\"}" > /dev/null

    # Submit
    echo "⭐ Review by $USER_NAME..."
    curl -s -b $COOKIE_FILE -X POST "$TARGET_URL/review/submit" \
         -H "Content-Type: application/json" \
         -d "{\"rating\":$RATING, \"comment\":\"$COMMENT\"}" > /dev/null
}

submit_review "Shirish Parekh" 5 "One of the best coffee cafe in Surat"
submit_review "Milan Choksey" 5 "Everything is good but they haven't wifi. Seating is low and very comfortable. Atmosphere is good and beautiful location."
submit_review "Milan Choksey 2" 5 "Nice place for coffee. The interior is very minimalist and aesthetically pleasing. Recommended for quiet evenings."
submit_review "Pratik K. Bhatu" 5 "Excellent place for coffee lovers."
submit_review "Karishma Nishant Tibarewal" 5 "Best coffee in Surat yes, we can definitely say that. The coffee here is amazing, and the food is equally good. They serve consistently lovely coffee and very good food."
submit_review "nadeem qureshi" 5 "Nice!"

# Cleanup
rm $COOKIE_FILE
echo "🎉 All data inserted successfully!"
