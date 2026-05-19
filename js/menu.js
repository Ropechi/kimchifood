/* MENU DATABASE - KIMCHI FOOD */

const MENU_DATA = [
    {
        id: "kimbap-bulgogi",
        name: "Kimbap Tradicional de Bulgogi",
        category: "platos",
        price: 30000,
        description: "Exquisito rollo de arroz envuelto en alga nori, relleno con carne de res picada marinada en salsa bulgogi, vegetales crujientes (zanahoria, espinaca), tortilla de huevo y rábano encurtido danmuji. (10 piezas gigantes)",
        spicy: 0,
        badge: "Más Vendido",
        image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "tteokbokki-clasico",
        name: "Tteokbokki Clásico Picante",
        category: "platos",
        price: 35000,
        description: "Famosos pasteles de arroz cilíndricos coreanos sumamente masticables, cocinados a fuego lento junto a láminas de pastel de pescado (eomuk) en una salsa dulce y picante a base de gochujang. Servido con sésamo espolvoreado y cebollitas de verdeo.",
        spicy: 2,
        badge: "Picante",
        image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "tteokbokki-queso",
        name: "Tteokbokki Especial con Queso",
        category: "platos",
        price: 40000,
        description: "Nuestra versión del tteokbokki clásico picante cubierto con una generosa capa fundida de queso mozzarella premium sopleteado al momento, ideal para suavizar el picante y lograr el 'cheese pull' perfecto.",
        spicy: 1,
        badge: "Favorito K-Pop",
        image: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "bibimbap-bowl",
        name: "Bibimbap Bowl Premium",
        category: "platos",
        price: 45000,
        description: "Cuenco de arroz cocido al vapor coronado artísticamente con montañas individuales de vegetales sazonados (brotes de soja, espinaca, zanahoria, calabacín y hongos), carne de res marinada, un huevo frito con yema blanda y salsa picante gochujang aparte.",
        spicy: 1,
        badge: "Saludable",
        image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "ramen-especial",
        name: "Ramen Coreano Especial",
        category: "platos",
        price: 30000,
        description: "Fideos coreanos gruesos servidos en un caldo picante concentrado de carne y mariscos al estilo tradicional de Seúl, acompañados de huevo marinado, láminas de nori, cebollita de verdeo y una guarnición de kimchi fresco.",
        spicy: 2,
        badge: "Reconfortante",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "mandu-frito",
        name: "Mandu Crujientes (6 uds.)",
        category: "entradas",
        price: 28000,
        description: "Empanaditas coreanas de masa ultra delgada rellenas de carne de cerdo seleccionada picada, fideos celofán y vegetales frescos. Doradas a la sartén para lograr una textura crocante y servidas con una salsa cítrica de soja y sésamo.",
        spicy: 0,
        badge: "Entrada",
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: "kimchi-pote",
        name: "Kimchi Artesanal (Pote 500g)",
        category: "pote",
        price: 25000,
        description: "Nuestro producto insignia envasado al vacío. Repollo coreano fermentado de forma 100% artesanal y tradicional con chile coreano (gochugaru), ajo, jengibre y especias. Ideal para acompañar tus platos favoritos en casa o cocinar arroz frito.",
        spicy: 2,
        badge: "Casero",
        image: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&q=80&w=600"
    }
];

// Helper to format currency to Paraguayan Guaranies
function formatGuarani(amount) {
    return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0
    }).format(amount).replace('PYG', 'Gs.');
}
