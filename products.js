/*
  Catálogo Laborathorno — edita aquí precios, mínimos y fotos.
  Campos:
    id        identificador único (sin espacios)
    name      nombre visible
    cat       id de categoría (ver CATEGORIES)
    price     precio en USD por unidad (null = "Consultar precio")
    min       cantidad mínima de venta
    unit      texto de unidad ("unidad", "pack de 6"...)
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
  { id: "navidad",     name: "Navidad" },
  { id: "tortas",      name: "Tortas y Bakery" },
  { id: "panaderia",   name: "Panadería Premium" },
  { id: "galletas",    name: "Galletas y Bollería" },
  { id: "panes",       name: "Pan y Pizzas" },
  { id: "minipostres", name: "Mini postres" },
  { id: "corporativo", name: "Corporativo" }
];

window.PRODUCTS = [
  // ——— Navidad ———
  { id: "pan-jamon", name: "Pan de Jamón Tradicional", cat: "navidad", price: 20, min: 1, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/pan-jamon-tradicional-1.webp", w: 800, h: 597, alt: "Pan de jamón tradicional cortado, con jamón, pasas y aceitunas en espiral, sobre un plato blanco" }, { src: "images/pan-jamon-tradicional-2.webp", w: 800, h: 597, alt: "Pan de jamón tradicional entero y dorado sobre una tabla, junto a la bolsa navideña de Laborathorno" }], tag: "Temporada",
    desc: "El clásico de la mesa navideña: jamón, pasas y aceitunas en una masa suave y dorada." },
  { id: "mini-pan-jamon", name: "Mini Pan de Jamón Tradicional", cat: "navidad", price: 5.5, min: 3, unit: "unidad",
    lead: "Elaboración diaria bajo pedido", minHours: 0, maxHours: 24, imgs: [{ src: "images/mini-pan-jamon-tradicional-1.webp", w: 800, h: 597, alt: "Mini panes de jamón tradicionales sobre una tabla, uno abierto mostrando jamón, aceitunas y pasas" }, { src: "images/mini-pan-jamon-tradicional-2.webp", w: 800, h: 597, alt: "Dos mitades de mini pan de jamón apiladas, con su relleno de jamón, aceituna y pasas" }], tag: "Temporada",
    desc: "Nuestra receta tradicional en tamaño individual. Ideal para compartir o regalar." },
  { id: "mini-pan-mortadela", name: "Mini Pan Navideño Mortadela y Pistacho", cat: "navidad", price: 6.5, min: 3, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/mini-pan-mortadela-pistacho-1.webp", w: 800, h: 597, alt: "Dos mini panes navideños de mortadela y pistacho, dorados y brillantes, sobre un plato blanco" }, { src: "images/mini-pan-mortadela-pistacho-2.webp", w: 800, h: 800, alt: "Mini pan navideño de mortadela y pistacho rebanado sobre una tabla de madera" }], tag: "Temporada",
    desc: "Una versión distinta del pan navideño: mortadela y pistacho en masa artesanal." },
  { id: "galletas-jengibre", name: "Galletas de Jengibre", cat: "navidad", price: 1.8, min: 6, unit: "unidad",
    lead: "Agendar 24 h", minHours: 24, maxHours: 24, imgs: [{ src: "images/galletas-jengibre.webp", w: 598, h: 800, alt: "Galleta de jengibre decorada con glaseado blanco sobre un paño, con anís estrellado y ramas de pino" }, { src: "images/galleta-jengibre-bolsa.webp", w: 301, h: 400, alt: "Galleta de jengibre empacada en bolsa transparente con lazo rojo" }], tag: "Temporada",
    desc: "Galletas especiadas decoradas a mano, empacadas una a una. Perfectas para detalles." },

  // ——— Tortas y Bakery ———
  { id: "torta-navidena", name: "Torta Navideña", cat: "tortas", price: 24, min: 1, unit: "unidad",
    lead: "Temporada de Navidad · Bajo pedido", minHours: 24, maxHours: 48, imgs: [{ src: "images/torta-navidena-1.webp", w: 597, h: 800, alt: "Torta Navideña vista desde arriba, con cobertura de crema, líneas de chocolate, frutos rojos, canela y romero" }, { src: "images/torta-navidena-2.webp", w: 597, h: 800, alt: "Torta Navideña completa sobre base blanca, con crema y decoración de frutos rojos" }], tag: "Temporada",
    sizes: [ { label: "1 kg", price: 24 }, { label: "Mini", price: 15 } ],
    desc: "Nuestra torta de temporada, pensada para la mesa de diciembre. Disponible en 1 kg o en tamaño mini." },
  { id: "torta-eventos", name: "Torta para Eventos", cat: "tortas", price: 25, min: 1, unit: "unidad",
    lead: "Bajo pedido", minHours: 24, maxHours: 48, imgs: [{ src: "images/torta-eventos-1.webp", w: 800, h: 597, alt: "Torta para eventos cubierta de crema blanca texturizada, con merengues, frutas y romero, sobre una base blanca" }, { src: "images/torta-eventos-2.webp", w: 800, h: 597, alt: "Torta para eventos vista desde arriba, decorada con merengues, frutas y romero" }],
    desc: "Diseñada a la medida de tu celebración. Cuéntanos la ocasión, el sabor y la cantidad de personas." },
  { id: "torta-cumpleanos", name: "Torta para Cumpleaños", cat: "tortas", price: 25, min: 1, unit: "unidad",
    lead: "Agendar con anticipación", minHours: 24, maxHours: 48, imgs: [{ src: "images/torta-cumpleanos.webp", w: 800, h: 597, alt: "Torta de cumpleaños con cobertura de colores y velas encendidas" }],
    desc: "Personalizada con el sabor y la decoración que imagines para ese día especial." },

  // ——— Panadería Premium ———
  { id: "hogaza", name: "Hogaza de Masa Madre", cat: "panaderia", price: 5, min: 1, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/hogaza-masa-madre.webp", w: 746, h: 1000, alt: "Mano sosteniendo una hogaza de masa madre recién horneada" }, { src: "images/hogaza-rebanada.webp", w: 330, h: 394, alt: "Rebanada de hogaza de masa madre con miga abierta" }], tag: "Favorito",
    desc: "Fermentación lenta, corteza crujiente y miga abierta. Pan de verdad, con tiempo." },
  { id: "croissant", name: "Croissant", cat: "panaderia", price: 3, min: 6, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/croissant.webp", w: 336, h: 384, alt: "Croissants dorados sobre papel con el logo de Laborathorno" }],
    desc: "Laminado a mano con mantequilla: capas finas, crujientes y aireadas." },
  { id: "brioche-molde", name: "Brioche de Molde", cat: "panaderia", price: 8.5, min: 1, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/brioche-molde.webp", w: 597, h: 800, alt: "Mano sosteniendo un brioche de molde dorado y brillante" }],
    desc: "Miga suave y mantecosa, perfecta para tostadas francesas o desayunos especiales." },
  { id: "pastel", name: "Pastel", cat: "panaderia", price: 2.6, min: 12, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/pastel-ricota-espinaca.webp", w: 258, h: 245, alt: "Pastel hojaldrado en forma de triángulo servido en un plato blanco" }],
    options: { label: "Relleno", values: ["Ricota y Espinaca", "Pollo", "Carne", "Queso"] },
    desc: "Masa hojaldrada y dorada con el relleno que prefieras." },
  { id: "pan-chocolate", name: "Pan de Chocolate", cat: "panaderia", price: 3, min: 6, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/pan-de-chocolate.webp", w: 329, h: 409, alt: "Pan de chocolate laminado y dorado" }],
    desc: "Masa de croissant con barras de chocolate en su interior." },
  { id: "pan-multicereal", name: "Pan Multicereal de Molde", cat: "panaderia", price: 5.5, min: 1, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/pan-multicereal.webp", w: 597, h: 800, alt: "Dos panes multicereal de molde apilados sobre una mano" }],
    desc: "Pan de molde con mezcla de cereales y semillas, ideal para el día a día." },

  // ——— Galletas y Bollería ———
  { id: "cookies-triple", name: "Cookies Triple Chocolate", cat: "galletas", price: 2.8, min: 6, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/cookies-triple-chocolate.webp", w: 597, h: 800, alt: "Mano sosteniendo una torre de cookies triple chocolate" }],
    desc: "Para los que nunca tienen suficiente chocolate: tres tipos en cada galleta." },
  { id: "cookies-chocolate", name: "Cookies de Chocolate", cat: "galletas", price: 2.8, min: 8, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/cookies-chocolate.webp", w: 309, h: 394, alt: "Cookies de chocolate saliendo de un frasco de vidrio" }],
    desc: "La clásica: bordes dorados, centro suave y trozos de chocolate." },
  { id: "brownies", name: "Brownies con Avellanas", cat: "galletas", price: 5.5, min: 4, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/brownies-avellanas.webp", w: 597, h: 800, alt: "Torre de brownies con avellanas y chispas de chocolate" }, { src: "images/brownies-stack.webp", w: 294, h: 397, alt: "Brownies apilados sobre fondo claro" }], tag: "Favorito",
    desc: "Densos, húmedos y con avellanas tostadas en cada bocado." },
  { id: "cookies-macadamia", name: "Cookies de Macadamia", cat: "galletas", price: 2, min: 12, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/cookies-macadamia.webp", w: 597, h: 800, alt: "Torre de cookies de macadamia con chocolate blanco" }],
    desc: "Galleta de vainilla con nueces de macadamia y chocolate blanco." },
  { id: "cookies-caramelo", name: "Cookies de Caramelo Salado", cat: "galletas", price: 3, min: 6, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/cookies-caramelo-salado.webp", w: 597, h: 800, alt: "Torre de cookies de caramelo salado" }],
    desc: "El equilibrio perfecto entre dulce y salado." },
  { id: "cookies-avellana", name: "Cookies de Chocolate y Avellana", cat: "galletas", price: 2.8, min: 6, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/cookies-chocolate-avellana.webp", w: 329, h: 395, alt: "Torre de cookies de chocolate y avellana sobre mármol oscuro" }],
    desc: "Masa de cacao intenso con avellanas y chocolate." },
  { id: "muffins-vainilla", name: "Muffins de Vainilla", cat: "galletas", price: 6, min: 6, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/muffins-vainilla.webp", w: 329, h: 410, alt: "Muffin de vainilla en cápsula de papel marrón" }],
    desc: "Esponjosos, aromáticos y horneados en su cápsula de papel." },

  // ——— Pan y Pizzas ———
  { id: "pan-perro-batata", name: "Pan de Perro de Batata 120 g", cat: "panes", price: 6.4, min: 8, unit: "paquete de 8",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/pan-perro-batata.webp", w: 366, h: 394, alt: "Panes de perro de batata alineados sobre papel con el logo de Laborathorno" }],
    desc: "Suave y ligeramente dulce gracias a la batata. Ideal para negocios de comida." },
  { id: "pan-hamburguesa-batata", name: "Pan de Hamburguesa de Batata 130 g", cat: "panes", price: 4.8, min: 8, unit: "paquete de 6",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/pan-hamburguesa-batata.webp", w: 800, h: 597, alt: "Panes de hamburguesa de batata dorados y esponjosos" }, { src: "images/pan-hamburguesa-bandeja.webp", w: 340, h: 395, alt: "Bandeja de panes de hamburguesa de batata recién horneados" }],
    desc: "Pan brioche de batata, firme por fuera y tierno por dentro." },

  // ——— Mini postres (mín. 20 por sabor) ———
  { id: "mp-cheesecake-frutos", name: "Mini Cheesecake de Frutos Rojos", cat: "minipostres", price: 1.5, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-cheesecake-frutos-rojos.webp", w: 800, h: 447, alt: "Mini cheesecakes de frutos rojos con fresa y arándanos, en platos individuales" }], desc: "Mini cheesecake cremoso con coulis de frutos rojos." },
  { id: "mp-shot-cheesecake", name: "Shot de Cheesecake", cat: "minipostres", price: 1.5, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/shot-cheesecake.webp", w: 800, h: 446, alt: "Bandeja con shots de cheesecake decorados con fresa" }], tag: "Nuevo", desc: "Crema de cheesecake y fresa servida en vasito, lista para mesas de evento." },
  { id: "mp-quesillo", name: "Mini Quesillo", cat: "minipostres", price: 1.5, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-quesillo.webp", w: 800, h: 447, alt: "Mini quesillos con caramelo, decorados con fresa y arándano, en una bandeja blanca" }], tag: "Nuevo", desc: "El quesillo venezolano de siempre, con su caramelo, en tamaño bocado." },
  { id: "mp-palmeritas", name: "Palmeritas con Chocolate", cat: "minipostres", price: 0.9, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/palmeritas-chocolate.webp", w: 800, h: 447, alt: "Palmeritas bañadas en chocolate con hilos de chocolate blanco" }], desc: "Hojaldre caramelizado bañado en chocolate." },
  { id: "mp-tiramisu", name: "Tiramisú", cat: "minipostres", price: 1.6, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/tiramisu.webp", w: 800, h: 446, alt: "Tiramisú con bizcochos y lazo marrón sobre un plato" }], desc: "Café, mascarpone y cacao en formato bocado." },
  { id: "mp-tres-leches", name: "Mini Shot de Tres Leches", cat: "minipostres", price: 1.6, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-shot-tres-leches.webp", w: 800, h: 447, alt: "Caja con mini shots de tres leches cubiertos de merengue tostado" }], desc: "El clásico tres leches en formato shot, húmedo y coronado con merengue tostado." },
  { id: "mp-tarta-queso", name: "Mini Tarta de Queso", cat: "minipostres", price: 1.2, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-tarta-queso.webp", w: 800, h: 447, alt: "Caja kraft con mini tartas de queso decoradas con flores comestibles" }], desc: "Tarta de queso horneada, dorada por fuera y cremosa por dentro." },
  { id: "mp-milhojas", name: "Mini Milhojas", cat: "minipostres", price: 0.8, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-milhojas.webp", w: 800, h: 447, alt: "Bandeja de mini milhojas con crema" }], desc: "Capas de hojaldre crujiente y crema pastelera." },
  { id: "mp-cheesecake-parchita", name: "Mini Cheesecake de Parchita", cat: "minipostres", price: 1.5, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-cheesecake-parchita.webp", w: 800, h: 446, alt: "Mini cheesecakes de parchita con cobertura de fruta y hoja de menta" }], desc: "Cremoso, con el toque ácido y tropical de la parchita." },
  { id: "mp-tarta-chocolate", name: "Mini Torta de Chocolate", cat: "minipostres", price: 1.6, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-torta-chocolate.webp", w: 800, h: 446, alt: "Bandeja de mini tortas de chocolate" }], desc: "Bizcocho de chocolate intenso en tamaño individual." },
  { id: "mp-pie-limon", name: "Mini Pie de Limón", cat: "minipostres", price: 1.5, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-pie-limon.webp", w: 408, h: 223, alt: "Bandeja de mini pies de limón con crema" }], desc: "Crema de limón fresca sobre base de galleta." },

  // ——— Soluciones corporativas ———
  { id: "co-pavlova", name: "Mini Pavlova", cat: "corporativo", price: 1, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-pavlova.webp", w: 800, h: 447, alt: "Mini pavlovas con crema y frutos rojos en un plato" }], desc: "Merengue crujiente con crema y fruta. Puedes elegir la variedad (mín. 20 por sabor)." },
  { id: "co-tartaleta-fresa", name: "Mini Tartaleta de Fresa", cat: "corporativo", price: 1.5, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-tartaleta-fresa.webp", w: 800, h: 446, alt: "Caja de Laborathorno con mini tartaletas de fresa" }], desc: "Masa sablé, crema pastelera y fresa fresca." },
  { id: "co-reinitas", name: "Reinitas de Corazón", cat: "corporativo", price: 1, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/reinitas-corazon.webp", w: 800, h: 447, alt: "Caja con reinitas en forma de corazón rellenas de mermelada" }], desc: "Delicadas galletas en forma de corazón. Puedes elegir la variedad (mín. 20 por sabor)." },
  { id: "co-pastelitos-queso", name: "Pastelitos de Queso", cat: "corporativo", price: 2.6, min: 12, unit: "unidad",
    lead: "Agendar 24-48 h", minHours: 24, maxHours: 48, imgs: [{ src: "images/pastelitos-queso.webp", w: 253, h: 270, alt: "Pastelito de queso hojaldrado servido en un plato blanco" }], desc: "Hojaldre dorado relleno de queso. Un básico para reuniones." },
  { id: "co-mini-cookies", name: "Mini Cookies", cat: "corporativo", price: 0.5, min: 20, unit: "unidad",
    lead: "Agendar 2-5 días", minHours: 48, maxHours: 120, imgs: [{ src: "images/mini-cookies.webp", w: 800, h: 447, alt: "Caja kraft con mini cookies de varios sabores" }], desc: "Galletas en tamaño bocado para coffee breaks. Puedes elegir la variedad (mín. 20 por sabor)." }
];

/* Temporadas anteriores (solo informativo, no se agrega al pedido) */
window.PAST_SEASON = [
  { name: "Galletas de Halloween", price: 7.5, unit: "pack de 6", season: "Halloween" }
];
