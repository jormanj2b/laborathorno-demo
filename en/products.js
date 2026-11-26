/*
  Catálogo Hearth & Crumb (demo ficticia) — edita aquí precios, mínimos y fotos.
  Campos:
    id        identificador único (sin espacios)
    name      nombre visible
    cat       id de categoría (ver CATEGORIES)
    price     precio en USD por unidad (null = "Consultar precio")
    min       cantidad mínima de venta
    unit      texto de unidad ("each", "pack of 6"...)
    lead      texto de anticipación
    minHours  horas mínimas de elaboración/anticipación (0 = el mismo día)
    maxHours  horas máximas de elaboración/anticipación
              Referencia: diario 0-24 · 24 h 24-24 · 24-48 h 24-48 · 2-5 días 48-120
              El carrito toma el producto con el mayor rango para estimar el pedido.
    imgs      fotos [{ src, w, h, alt }] — la primera es la principal; si hay varias,
              la tarjeta muestra botones para cambiar de foto. [] = tarjeta con el sello TH
    desc      descripción corta
    options   { label, values[] } selector de sabor/variedad (opcional)
    sizes     [{ label, price }] selector de tamaño con su precio (opcional)
    tag       etiqueta destacada (opcional)
*/
window.CATEGORIES = [
  { id: "navidad",     name: "Christmas" },
  { id: "tortas",      name: "Cakes" },
  { id: "panaderia",   name: "Premium Bread" },
  { id: "galletas",    name: "Cookies & Pastries" },
  { id: "panes",       name: "Buns & Bread" },
  { id: "minipostres", name: "Mini Desserts" },
  { id: "corporativo", name: "Corporate" }
];

window.PRODUCTS = [
  // ——— Navidad ———
  { id: "pan-jamon", name: "Traditional Pan de Jamón", cat: "navidad", price: 20, min: 1, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "../images/pan-jamon-tradicional-1.webp", w: 800, h: 597, alt: "Sliced traditional pan de jamón with a spiral of ham, raisins and olives on a white plate" }], tag: "Seasonal",
    desc: "Venezuela’s Christmas classic: ham, raisins and olives rolled into a soft, golden bread." },
  { id: "mini-pan-jamon", name: "Mini Pan de Jamón", cat: "navidad", price: 5.5, min: 3, unit: "each",
    lead: "Baked daily to order", minHours: 0, maxHours: 24, imgs: [{ src: "../images/mini-pan-jamon-tradicional-2.webp", w: 800, h: 597, alt: "Two stacked halves of a mini pan de jamón filled with ham, olives and raisins" }], tag: "Seasonal",
    desc: "Our traditional recipe in a single-serving size. Great for sharing or gifting." },
  { id: "mini-pan-mortadela", name: "Mini Mortadella & Pistachio Holiday Bread", cat: "navidad", price: 6.5, min: 3, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/mini-pan-mortadela-pistacho-1.webp", w: 800, h: 597, alt: "Two glossy golden mortadella and pistachio mini holiday breads on a white plate" }], tag: "Seasonal",
    desc: "A new take on holiday bread: mortadella and pistachio in a handmade dough." },
  { id: "galletas-jengibre", name: "Gingerbread Cookies", cat: "navidad", price: 1.8, min: 6, unit: "each",
    lead: "Order 24 hrs ahead", minHours: 24, maxHours: 24, imgs: [{ src: "img/galleta-jengibre-bolsa.webp", w: 301, h: 400, alt: "Gingerbread cookie in a clear bag tied with a red ribbon" }], tag: "Seasonal",
    desc: "Spiced cookies decorated by hand and wrapped one by one. Perfect as small gifts." },

  // ——— Tortas y Bakery ———
  { id: "torta-navidena", name: "Christmas Cake", cat: "tortas", price: 24, min: 1, unit: "each",
    lead: "Christmas season · Made to order", minHours: 24, maxHours: 48, imgs: [{ src: "../images/torta-navidena-1.webp", w: 597, h: 800, alt: "Christmas cake from above, with cream frosting, chocolate drizzle, berries, cinnamon and rosemary" }, { src: "../images/torta-navidena-2.webp", w: 597, h: 800, alt: "Whole Christmas cake on a white stand, with cream and berries" }], tag: "Seasonal",
    sizes: [ { label: "2.2 lb (1 kg)", price: 24 }, { label: "Mini", price: 15 } ],
    desc: "Our seasonal cake, made for the December table. Comes in 2.2 lb (1 kg) or mini size." },
  { id: "torta-eventos", name: "Event Cake", cat: "tortas", price: 25, min: 1, unit: "each",
    lead: "Made to order", minHours: 24, maxHours: 48, imgs: [{ src: "../images/torta-eventos-1.webp", w: 800, h: 597, alt: "Event cake covered in textured white cream with meringues, fruit and rosemary on a white stand" }, { src: "../images/torta-eventos-2.webp", w: 800, h: 597, alt: "Event cake from above, decorated with meringues, fruit and rosemary" }],
    desc: "Designed around your celebration. Tell us the occasion, the flavor and how many guests." },
  { id: "torta-cumpleanos", name: "Birthday Cake", cat: "tortas", price: 25, min: 1, unit: "each",
    lead: "Order ahead", minHours: 24, maxHours: 48, imgs: [{ src: "../images/torta-cumpleanos.webp", w: 800, h: 597, alt: "Birthday cake with colorful frosting and lit candles" }],
    desc: "Made with the flavor and decoration you have in mind for the big day." },

  // ——— Panadería Premium ———
  { id: "hogaza", name: "Sourdough Loaf", cat: "panaderia", price: 5, min: 1, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/hogaza-masa-madre.webp", w: 746, h: 1000, alt: "Hand holding a fresh-baked sourdough loaf" }], tag: "Favorite",
    desc: "Slow fermentation, a crackly crust and an open crumb. Real bread that takes its time." },
  { id: "croissant", name: "Croissant", cat: "panaderia", price: 3, min: 6, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/croissant.webp", w: 336, h: 384, alt: "Golden croissants on a sheet of baking paper" }],
    desc: "Laminated by hand with butter: thin, crisp, airy layers." },
  { id: "brioche-molde", name: "Brioche Loaf", cat: "panaderia", price: 8.5, min: 1, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/brioche-molde.webp", w: 597, h: 800, alt: "Hand holding a glossy golden brioche loaf" }],
    desc: "Soft, buttery crumb, perfect for French toast or a special breakfast." },
  { id: "pastel", name: "Savory Hand Pie", cat: "panaderia", price: 2.6, min: 12, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "../images/pastel-ricota-espinaca.webp", w: 258, h: 245, alt: "Triangle-shaped puff pastry hand pie on a white plate" }],
    options: { label: "Filling", values: ["Ricotta & Spinach", "Chicken", "Beef", "Cheese"] },
    desc: "Golden puff pastry with the filling of your choice." },
  { id: "pan-chocolate", name: "Pain au Chocolat", cat: "panaderia", price: 3, min: 6, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/pan-de-chocolate.webp", w: 329, h: 409, alt: "Golden laminated pain au chocolat" }],
    desc: "Croissant dough wrapped around chocolate batons." },
  { id: "pan-multicereal", name: "Multigrain Sandwich Loaf", cat: "panaderia", price: 5.5, min: 1, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/pan-multicereal.webp", w: 597, h: 800, alt: "Two multigrain sandwich loaves stacked on a hand" }],
    desc: "Sandwich bread with mixed grains and seeds, made for every day." },

  // ——— Galletas y Bollería ———
  { id: "cookies-triple", name: "Triple Chocolate Cookies", cat: "galletas", price: 2.8, min: 6, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/cookies-triple-chocolate.webp", w: 597, h: 800, alt: "Hand holding a stack of triple chocolate cookies" }],
    desc: "For people who can’t get enough chocolate: three kinds in every cookie." },
  { id: "cookies-chocolate", name: "Chocolate Chip Cookies", cat: "galletas", price: 2.8, min: 8, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "../images/cookies-chocolate.webp", w: 309, h: 394, alt: "Chocolate chip cookies spilling out of a glass jar" }],
    desc: "The classic: golden edges, a soft center and chunks of chocolate." },
  { id: "brownies", name: "Hazelnut Brownies", cat: "galletas", price: 5.5, min: 4, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/brownies-avellanas.webp", w: 597, h: 800, alt: "Stack of brownies with hazelnuts and chocolate chips" }, { src: "img/brownies-stack.webp", w: 294, h: 397, alt: "Stacked brownies on a light background" }], tag: "Favorite",
    desc: "Dense and fudgy, with toasted hazelnuts in every bite." },
  { id: "cookies-macadamia", name: "White Chocolate Macadamia Cookies", cat: "galletas", price: 2, min: 12, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/cookies-macadamia.webp", w: 597, h: 800, alt: "Stack of white chocolate macadamia cookies" }],
    desc: "Vanilla cookie with macadamia nuts and white chocolate." },
  { id: "cookies-caramelo", name: "Salted Caramel Cookies", cat: "galletas", price: 3, min: 6, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/cookies-caramelo-salado.webp", w: 597, h: 800, alt: "Stack of salted caramel cookies" }],
    desc: "Sweet and salty in the right balance." },
  { id: "cookies-avellana", name: "Chocolate Hazelnut Cookies", cat: "galletas", price: 2.8, min: 6, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/cookies-chocolate-avellana.webp", w: 329, h: 395, alt: "Stack of chocolate hazelnut cookies on dark marble" }],
    desc: "Deep cocoa dough with hazelnuts and chocolate." },
  { id: "muffins-vainilla", name: "Vanilla Muffins", cat: "galletas", price: 6, min: 6, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/muffins-vainilla.webp", w: 329, h: 410, alt: "Vanilla muffin in a brown paper liner" }],
    desc: "Fluffy, fragrant and baked in their paper liners." },

  // ——— Pan y Pizzas ———
  { id: "pan-perro-batata", name: "Sweet Potato Hot Dog Buns, 4.2 oz", cat: "panes", price: 6.4, min: 8, unit: "pack of 8",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/pan-perro-batata.webp", w: 366, h: 394, alt: "Sweet potato hot dog buns lined up on baking paper" }],
    desc: "Soft and a little sweet from the sweet potato. Made for food businesses." },
  { id: "pan-hamburguesa-batata", name: "Sweet Potato Burger Buns, 4.6 oz", cat: "panes", price: 4.8, min: 8, unit: "pack of 6",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "img/pan-hamburguesa-batata.webp", w: 800, h: 597, alt: "Golden, fluffy sweet potato burger buns" }, { src: "img/pan-hamburguesa-bandeja.webp", w: 340, h: 395, alt: "Tray of fresh-baked sweet potato burger buns" }],
    desc: "Sweet potato brioche, sturdy outside and tender inside." },

  // ——— Mini postres (mín. 20 por sabor) ———
  { id: "mp-cheesecake-frutos", name: "Mini Berry Cheesecake", cat: "minipostres", price: 1.5, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "../images/mini-cheesecake-frutos-rojos.webp", w: 800, h: 447, alt: "Mini berry cheesecakes topped with strawberry and blueberries on small plates" }], desc: "Creamy mini cheesecake with berry coulis." },
  { id: "mp-shot-cheesecake", name: "Cheesecake Cup", cat: "minipostres", price: 1.5, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/shot-cheesecake.webp", w: 800, h: 446, alt: "Tray of cheesecake cups topped with strawberry" }], tag: "New", desc: "Cheesecake cream and strawberry in a small cup, ready for event tables." },
  { id: "mp-quesillo", name: "Mini Quesillo (Venezuelan Flan)", cat: "minipostres", price: 1.5, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-quesillo.webp", w: 800, h: 447, alt: "Mini quesillos with caramel, topped with strawberry and blueberry on a white tray" }], tag: "New", desc: "Classic Venezuelan flan with its caramel, in a bite-size portion." },
  { id: "mp-palmeritas", name: "Chocolate Palmiers", cat: "minipostres", price: 0.9, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/palmeritas-chocolate.webp", w: 800, h: 447, alt: "Chocolate-dipped palmiers with white chocolate drizzle" }], desc: "Caramelized puff pastry dipped in chocolate." },
  { id: "mp-tiramisu", name: "Tiramisu", cat: "minipostres", price: 1.6, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/tiramisu.webp", w: 800, h: 446, alt: "Tiramisu with ladyfingers and a brown ribbon on a plate" }], desc: "Coffee, mascarpone and cocoa in a bite-size portion." },
  { id: "mp-tres-leches", name: "Mini Tres Leches Cup", cat: "minipostres", price: 1.6, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-shot-tres-leches.webp", w: 800, h: 447, alt: "Box of mini tres leches cups topped with toasted meringue" }], desc: "Classic tres leches in a small cup, soaked and topped with toasted meringue." },
  { id: "mp-tarta-queso", name: "Mini Baked Cheesecake", cat: "minipostres", price: 1.2, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-tarta-queso.webp", w: 800, h: 447, alt: "Kraft box of mini baked cheesecakes decorated with edible flowers" }], desc: "Baked cheesecake, golden outside and creamy inside." },
  { id: "mp-milhojas", name: "Mini Napoleons", cat: "minipostres", price: 0.8, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-milhojas.webp", w: 800, h: 447, alt: "Tray of mini napoleons with cream" }], desc: "Layers of crisp puff pastry and pastry cream." },
  { id: "mp-cheesecake-parchita", name: "Mini Passion Fruit Cheesecake", cat: "minipostres", price: 1.5, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-cheesecake-parchita.webp", w: 800, h: 446, alt: "Mini passion fruit cheesecakes with fruit topping and a mint leaf" }], desc: "Creamy, with the tart, tropical kick of passion fruit." },
  { id: "mp-tarta-chocolate", name: "Mini Chocolate Cake", cat: "minipostres", price: 1.6, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-torta-chocolate.webp", w: 800, h: 446, alt: "Tray of mini chocolate cakes" }], desc: "Rich chocolate cake in a single-serving size." },
  { id: "mp-pie-limon", name: "Mini Lemon Pie", cat: "minipostres", price: 1.5, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-pie-limon.webp", w: 408, h: 223, alt: "Tray of mini lemon pies with cream" }], desc: "Fresh lemon cream on a cookie crust." },

  // ——— Soluciones corporativas ———
  { id: "co-pavlova", name: "Mini Pavlova", cat: "corporativo", price: 1, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-pavlova.webp", w: 800, h: 447, alt: "Mini pavlovas with cream and berries on a plate" }], desc: "Crisp meringue with cream and fruit. Pick your flavors (min. 20 per flavor)." },
  { id: "co-tartaleta-fresa", name: "Mini Strawberry Tart", cat: "corporativo", price: 1.5, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-tartaleta-fresa.webp", w: 800, h: 446, alt: "Box of mini strawberry tarts" }], desc: "Sablé crust, pastry cream and fresh strawberry." },
  { id: "co-reinitas", name: "Heart Jam Cookies", cat: "corporativo", price: 1, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/reinitas-corazon.webp", w: 800, h: 357, alt: "Box of heart-shaped cookies filled with jam" }], desc: "Delicate heart-shaped cookies. Pick your flavors (min. 20 per flavor)." },
  { id: "co-pastelitos-queso", name: "Cheese Pastelitos", cat: "corporativo", price: 2.6, min: 12, unit: "each",
    lead: "Order 24–48 hrs ahead", minHours: 24, maxHours: 48, imgs: [{ src: "../images/pastelitos-queso.webp", w: 253, h: 270, alt: "Flaky cheese pastelito on a white plate" }], desc: "Golden puff pastry filled with cheese. A go-to for meetings." },
  { id: "co-mini-cookies", name: "Mini Cookies", cat: "corporativo", price: 0.5, min: 20, unit: "each",
    lead: "Order 2–5 days ahead", minHours: 48, maxHours: 120, imgs: [{ src: "img/mini-cookies.webp", w: 800, h: 447, alt: "Kraft box of mini cookies in assorted flavors" }], desc: "Bite-size cookies for coffee breaks. Pick your flavors (min. 20 per flavor)." }
];

/* Temporadas anteriores (solo informativo, no se agrega al pedido) */
window.PAST_SEASON = [
  { name: "Halloween Cookies", price: 7.5, unit: "pack of 6", season: "Halloween" }
];
