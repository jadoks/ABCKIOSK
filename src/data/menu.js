/*
 * Hardcoded menu (temporary). Put the photos in public/images/menu/ using the file names below.
 * If a photo is missing, the card shows the illustrated .svg when one exists, then an icon placeholder, so the app still works without images.
 * Photo file names + prompts / search keywords for every item are listed in IMAGES.md.
 */
export const CATEGORIES = [
  { id: 'all', label: 'All Items', sub: null, icon: 'grid' },
  { id: 'rice', label: 'Rice Meals', sub: 'Student Favorites', icon: 'rice' },
  { id: 'noodles', label: 'Noodles', sub: 'Pasta & Ramen', icon: 'noodle' },
  { id: 'sandwiches', label: 'Sandwiches', sub: 'Grab & Go Packs', icon: 'sandwich' },
  { id: 'snacks', label: 'Snacks', sub: 'Fries, Siomai & More', icon: 'snack' },
  { id: 'drinks', label: 'Campus Drinks', sub: 'Cold Brews & Teas', icon: 'cup' },
  { id: 'desserts', label: 'Desserts', sub: 'Sweet Endings', icon: 'dessert' },
]

const img = (name) => `/images/menu/${name}.jpg`
const art = (name) => `/images/menu/${name}.svg` // illustrated fallback (npm run art), only for the original 11 items

export const ITEMS = [
  // Rice meals
  { id: 'chicken-fillet', category: 'rice', name: 'Crispy Chicken Fillet Meal', price: 95, ready: 10, cals: 300,
    desc: 'Garlic rice and peppery home gravy with a golden fried fillet.', image: img('crispy-chicken-fillet-meal'), fallback: art('crispy-chicken-fillet-meal') },
  { id: 'beef-tapa', category: 'rice', name: 'Beef Tapa & Egg Bowl', price: 110, ready: 10, cals: 330,
    desc: 'Sweet and savory cured sirloin with a sunny-side-up egg.', image: img('beef-tapa-egg-bowl'), fallback: art('beef-tapa-egg-bowl') },
  { id: 'sisig-bowl', category: 'rice', name: 'Sizzling Sisig Bowl', price: 100, ready: 10, cals: 480,
    desc: 'Crispy savory pork, chili, and egg served over garlic rice.', image: img('sizzling-sisig-bowl'), fallback: art('sizzling-sisig-bowl') },
  { id: 'chicken-adobo', category: 'rice', name: 'Chicken Adobo Rice Bowl', price: 90, ready: 8, cals: 420,
    desc: 'Soy-vinegar braised chicken over steamed rice with a boiled egg.', image: img('chicken-adobo-rice-bowl') },
  { id: 'pork-bbq', category: 'rice', name: 'Pork BBQ Rice Meal', price: 95, ready: 10, cals: 520,
    desc: 'Two sweet-smoky grilled pork skewers with rice and atchara.', image: img('pork-bbq-rice-meal') },
  { id: 'chicken-inasal', category: 'rice', name: 'Chicken Inasal Rice', price: 105, ready: 12, cals: 510,
    desc: 'Calamansi-annatto grilled chicken leg with garlic rice.', image: img('chicken-inasal-rice') },
  { id: 'longsilog', category: 'rice', name: 'Longganisa & Egg Silog', price: 85, ready: 8, cals: 480,
    desc: 'Sweet native sausage, sunny-side egg and garlic fried rice.', image: img('longganisa-egg-silog') },

  // Noodles & pasta
  { id: 'pinoy-spaghetti', category: 'noodles', name: 'Filipino-Style Spaghetti', price: 70, ready: 8, cals: 520,
    desc: 'Sweet meaty sauce, sliced hotdog and a blanket of cheese.', image: img('filipino-style-spaghetti') },
  { id: 'pancit-canton', category: 'noodles', name: 'Pancit Canton', price: 65, ready: 7, cals: 400,
    desc: 'Stir-fried egg noodles with chicken, cabbage and carrots.', image: img('pancit-canton') },
  { id: 'carbonara', category: 'noodles', name: 'Creamy Carbonara', price: 85, ready: 9, cals: 560,
    desc: 'Fettuccine in garlic cream sauce with bacon and parmesan.', image: img('creamy-carbonara') },
  { id: 'beef-ramen', category: 'noodles', name: 'Beef Ramen Bowl', price: 110, ready: 10, cals: 480,
    desc: 'Rich savory broth, tender beef slices, egg and spring onion.', image: img('beef-ramen-bowl') },

  // Sandwiches & burgers
  { id: 'tuna-panini', category: 'sandwiches', name: 'Tuna Melt Panini', price: 75, ready: 5, cals: 420,
    desc: 'Flaky skipjack tuna and triple cheddar on crusty pressed bread.', image: img('tuna-melt-panini'), fallback: art('tuna-melt-panini') },
  { id: 'clubhouse', category: 'sandwiches', name: 'Clubhouse Sandwich', price: 85, ready: 6, cals: 480,
    desc: 'Triple-decker grilled chicken, egg, bacon, lettuce, and tomato.', image: img('clubhouse-sandwich'), fallback: art('clubhouse-sandwich') },
  { id: 'grilled-cheese', category: 'sandwiches', name: 'Grilled Cheese Toast', price: 60, ready: 4, cals: 380,
    desc: 'Melted mozzarella and sharp cheddar on thick buttered toast.', image: img('grilled-cheese-toast'), fallback: art('grilled-cheese-toast') },
  { id: 'caesar-wrap', category: 'sandwiches', name: 'Chicken Caesar Wrap', price: 80, ready: 5, cals: 450,
    desc: 'Grilled chicken, crisp romaine, and parmesan in a tortilla.', image: img('chicken-caesar-wrap'), fallback: art('chicken-caesar-wrap') },
  { id: 'cheeseburger', category: 'sandwiches', name: 'Classic Cheeseburger', price: 90, ready: 8, cals: 560,
    desc: 'Juicy beef patty, melted cheese, pickles and house sauce.', image: img('classic-cheeseburger') },
  { id: 'chicken-burger', category: 'sandwiches', name: 'Crispy Chicken Burger', price: 95, ready: 8, cals: 540,
    desc: 'Crunchy fried chicken, lettuce and mayo in a toasted bun.', image: img('crispy-chicken-burger') },
  { id: 'ham-egg', category: 'sandwiches', name: 'Ham & Egg Sandwich', price: 55, ready: 4, cals: 360,
    desc: 'Fluffy scrambled egg and sweet ham on soft toasted bread.', image: img('ham-egg-sandwich') },

  // Snacks & sides
  { id: 'fries', category: 'snacks', name: 'Crinkle-Cut Fries', price: 55, ready: 5, cals: 380,
    desc: 'Golden crinkle fries, lightly salted, with a ketchup dip.', image: img('crinkle-cut-fries') },
  { id: 'nuggets', category: 'snacks', name: 'Chicken Nuggets (6 pcs)', price: 70, ready: 6, cals: 290,
    desc: 'Crispy bite-size chicken with a sweet chili dip.', image: img('chicken-nuggets') },
  { id: 'siomai', category: 'snacks', name: 'Pork Siomai (4 pcs)', price: 45, ready: 5, cals: 220,
    desc: 'Steamed pork dumplings with soy, calamansi and chili garlic.', image: img('pork-siomai') },
  { id: 'lumpia', category: 'snacks', name: 'Lumpia Shanghai (6 pcs)', price: 60, ready: 6, cals: 330,
    desc: 'Crispy pork spring rolls with sweet chili dipping sauce.', image: img('lumpia-shanghai') },
  { id: 'cheese-sticks', category: 'snacks', name: 'Cheese Sticks (5 pcs)', price: 40, ready: 4, cals: 260,
    desc: 'Melty cheese in a crisp golden roll, served with ketchup.', image: img('cheese-sticks') },

  // Campus drinks
  { id: 'caramel-brew', category: 'drinks', name: 'Iced Caramel Brew', price: 65, ready: 2, cals: 160,
    desc: 'Slow-steeped Arabica with a sweet caramel ribbon and milk.', image: img('iced-caramel-brew'), fallback: art('iced-caramel-brew') },
  { id: 'cold-brew', category: 'drinks', name: 'Cold Brew Coffee', price: 60, ready: 1, cals: 5,
    desc: 'Smooth, 12-hour steeped signature house blend.', image: img('cold-brew-coffee'), fallback: art('cold-brew-coffee') },
  { id: 'matcha-latte', category: 'drinks', name: 'Matcha Oat Latte', price: 75, ready: 3, cals: 190,
    desc: 'Premium stone-ground green tea whisked with creamy oat milk.', image: img('matcha-oat-latte'), fallback: art('matcha-oat-latte') },
  { id: 'fruity-tea', category: 'drinks', name: 'Fruity Iced Tea', price: 50, ready: 1, cals: 90,
    desc: 'Refreshing black tea infused with real citrus and berry slices.', image: img('fruity-iced-tea'), fallback: art('fruity-iced-tea') },
  { id: 'milk-tea', category: 'drinks', name: 'Brown Sugar Milk Tea', price: 70, ready: 3, cals: 280,
    desc: 'Black tea and fresh milk with chewy brown sugar pearls.', image: img('brown-sugar-milk-tea') },
  { id: 'mango-shake', category: 'drinks', name: 'Mango Shake', price: 65, ready: 3, cals: 220,
    desc: 'Thick, ripe Philippine mango blended with milk and ice.', image: img('mango-shake') },
  { id: 'calamansi', category: 'drinks', name: 'Calamansi Juice', price: 40, ready: 1, cals: 80,
    desc: 'Fresh-squeezed calamansi, lightly sweetened, served over ice.', image: img('calamansi-juice') },
  { id: 'iced-choco', category: 'drinks', name: 'Iced Chocolate', price: 65, ready: 2, cals: 240,
    desc: 'Rich dark cocoa and cold milk poured over ice.', image: img('iced-chocolate') },

  // Desserts
  { id: 'leche-flan', category: 'desserts', name: 'Leche Flan', price: 45, ready: 2, cals: 260,
    desc: 'Silky caramel custard, slow-steamed the traditional way.', image: img('leche-flan') },
  { id: 'halo-halo', category: 'desserts', name: 'Halo-Halo', price: 85, ready: 4, cals: 350,
    desc: 'Shaved ice, sweet beans, fruit, ube and leche flan with milk.', image: img('halo-halo') },
  { id: 'brownie', category: 'desserts', name: 'Chocolate Fudge Brownie', price: 50, ready: 2, cals: 340,
    desc: 'Dense, fudgy chocolate brownie with a crackly top.', image: img('chocolate-fudge-brownie') },
  { id: 'turon', category: 'desserts', name: 'Banana Turon (2 pcs)', price: 35, ready: 4, cals: 240,
    desc: 'Saba banana and jackfruit in a crisp caramelized wrapper.', image: img('banana-turon') },
]