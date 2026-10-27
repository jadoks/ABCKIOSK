/*
 * Hardcoded menu (temporary). Put the photos in public/images/menu/ using the file names below.
 * If a photo is missing, the card shows the illustrated .svg, then an icon placeholder, so the app still works without images.
 */
export const CATEGORIES = [
  { id: 'all', label: 'All Items', sub: null, icon: 'grid' },
  { id: 'rice', label: 'Rice Meals', sub: 'Student Favorites', icon: 'rice' },
  { id: 'sandwiches', label: 'Sandwiches', sub: 'Grab & Go Packs', icon: 'sandwich' },
  { id: 'drinks', label: 'Campus Drinks', sub: 'Cold Brews & Teas', icon: 'cup' },
]

const img = (name) => `/images/menu/${name}.jpg`
const art = (name) => `/images/menu/${name}.svg` // illustrated fallback (npm run art)

export const ITEMS = [
  // Rice meals
  { id: 'chicken-fillet', category: 'rice', name: 'Crispy Chicken Fillet Meal', price: 95, ready: 10, cals: 300,
    desc: 'Garlic rice and peppery home gravy with a golden fried fillet.', image: img('crispy-chicken-fillet-meal'), fallback: art('crispy-chicken-fillet-meal') },
  { id: 'beef-tapa', category: 'rice', name: 'Beef Tapa & Egg Bowl', price: 110, ready: 10, cals: 330,
    desc: 'Sweet and savory cured sirloin with a sunny-side-up egg.', image: img('beef-tapa-egg-bowl'), fallback: art('beef-tapa-egg-bowl') },
  { id: 'sisig-bowl', category: 'rice', name: 'Sizzling Sisig Bowl', price: 100, ready: 10, cals: 480,
    desc: 'Crispy savory pork, chili, and egg served over garlic rice.', image: img('sizzling-sisig-bowl'), fallback: art('sizzling-sisig-bowl') },

  // Sandwiches
  { id: 'tuna-panini', category: 'sandwiches', name: 'Tuna Melt Panini', price: 75, ready: 5, cals: 420,
    desc: 'Flaky skipjack tuna and triple cheddar on crusty pressed bread.', image: img('tuna-melt-panini'), fallback: art('tuna-melt-panini') },
  { id: 'clubhouse', category: 'sandwiches', name: 'Clubhouse Sandwich', price: 85, ready: 6, cals: 480,
    desc: 'Triple-decker grilled chicken, egg, bacon, lettuce, and tomato.', image: img('clubhouse-sandwich'), fallback: art('clubhouse-sandwich') },
  { id: 'grilled-cheese', category: 'sandwiches', name: 'Grilled Cheese Toast', price: 60, ready: 4, cals: 380,
    desc: 'Melted mozzarella and sharp cheddar on thick buttered toast.', image: img('grilled-cheese-toast'), fallback: art('grilled-cheese-toast') },
  { id: 'caesar-wrap', category: 'sandwiches', name: 'Chicken Caesar Wrap', price: 80, ready: 5, cals: 450,
    desc: 'Grilled chicken, crisp romaine, and parmesan in a tortilla.', image: img('chicken-caesar-wrap'), fallback: art('chicken-caesar-wrap') },

  // Campus drinks
  { id: 'caramel-brew', category: 'drinks', name: 'Iced Caramel Brew', price: 65, ready: 2, cals: 160,
    desc: 'Slow-steeped Arabica with a sweet caramel ribbon and milk.', image: img('iced-caramel-brew'), fallback: art('iced-caramel-brew') },
  { id: 'cold-brew', category: 'drinks', name: 'Cold Brew Coffee', price: 60, ready: 1, cals: 5,
    desc: 'Smooth, 12-hour steeped signature house blend.', image: img('cold-brew-coffee'), fallback: art('cold-brew-coffee') },
  { id: 'matcha-latte', category: 'drinks', name: 'Matcha Oat Latte', price: 75, ready: 3, cals: 190,
    desc: 'Premium stone-ground green tea whisked with creamy oat milk.', image: img('matcha-oat-latte'), fallback: art('matcha-oat-latte') },
  { id: 'fruity-tea', category: 'drinks', name: 'Fruity Iced Tea', price: 50, ready: 1, cals: 90,
    desc: 'Refreshing black tea infused with real citrus and berry slices.', image: img('fruity-iced-tea'), fallback: art('fruity-iced-tea') },
]
