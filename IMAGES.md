# Menu photos

Save each photo in THIS folder (`public/images/menu/`) using the exact file name below.
Format: JPG, landscape ~4:3 (about 800 x 600), under 200 KB each. Missing photos show a placeholder.

Style to use for every prompt (keeps the set consistent):
"Professional food photography, dark slate surface, moody warm lighting, shallow depth of field, 45-degree angle, no text, no logos, no people"

| File name | Prompt (add the style line above) |
|---|---|
| crispy-chicken-fillet-meal.jpg | Crispy golden fried chicken fillet sliced, over garlic rice with brown peppery gravy, scallions, on a dark plate with fork |
| beef-tapa-egg-bowl.jpg | Bowl of garlic fried rice topped with sweet cured beef tapa strips and a sunny-side-up egg, toasted garlic |
| sizzling-sisig-bowl.jpg | Crispy pork sisig with chopped chili, onions and a fried egg served over garlic rice in a rustic bowl |
| tuna-melt-panini.jpg | Pressed tuna melt panini cut in half showing melted cheddar and tuna filling, small bowl of tuna salad beside it |
| clubhouse-sandwich.jpg | Triple-decker clubhouse sandwich with grilled chicken, egg, bacon, lettuce and tomato, cut in halves, side of fries |
| grilled-cheese-toast.jpg | Thick buttered grilled cheese toast pulled apart with stretching melted mozzarella and cheddar, small dipping sauce |
| chicken-caesar-wrap.jpg | Grilled chicken caesar wrap cut in half, crisp romaine and parmesan visible, tortilla lightly toasted |
| iced-caramel-brew.jpg | Tall plastic cup of iced caramel coffee with caramel drizzle and milk swirl, blurred cafe background |
| cold-brew-coffee.jpg | Glass of black cold brew coffee over large ice cubes, condensation on the glass, small side dish |
| matcha-oat-latte.jpg | Glass of iced matcha oat latte with green and creamy white layers, blurred cafe background |
| fruity-iced-tea.jpg | Tall glass of iced black tea with orange, lemon and berry slices, mint garnish, ice cubes |


Auto-generate: `OPENAI_API_KEY=sk-... npm run images` reads `scripts/menu-prompts.json` (same prompts as this table). Until a `.jpg` exists the app shows the illustrated `.svg` of the same name (`npm run art`).
