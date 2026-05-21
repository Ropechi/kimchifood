/* MENU DATABASE - KIMCHI FOOD */

const MENU_DATA = [
    {
        id: "tteokbokki",
        name: "Tteokbokki (떡볶이)",
        category: "platos",
        price: 40000,
        description: "Bastones de arroz masticables cocinados en una salsa roja, espesa, dulce y picante. Acompañados de pastel de pescado, cebollita de verdeo y huevo duro. ¡Un clásico del street food!",
        spicy: 2,
        badge: "Street Food",
        image: "Tteokbokki.jpg"
    },
    {
        id: "gimbap-tradicional",
        name: "Gimbap Tradicional (김밥)",
        category: "platos",
        price: 35000,
        description: "Rollo de alga y arroz sazonado con aceite de sésamo. Relleno de vegetales frescos (zanahoria, espinaca, rábano encurtido), huevo y carne vacuna. Fresco y súper llenador.",
        spicy: 0,
        badge: "Súper Fresco",
        image: "kimbap.jpg"
    },
    {
        id: "kimchi-pote",
        name: "Kimchi Artesanal - 500g (김치)",
        category: "pote",
        price: 30000,
        description: "Col china fermentada de forma artesanal con ajo, jengibre y chile coreano. El acompañamiento tradicional, picante y saludable por excelencia. Presentación en pote de 500g.",
        spicy: 2,
        badge: "Saludable",
        image: "kimchi.jpg"
    },
    {
        id: "chikin-pollo",
        name: "Chikin - Pollo Frito Coreano (한국식 치킨)",
        category: "entradas",
        price: 50000,
        description: "Cinco piezas de pollo súper crujientes por fuera y jugosas por dentro. Bañadas en nuestra exclusiva salsa agridulce con un sutil toque picante y sésamo.",
        spicy: 1,
        badge: "Crujiente",
        image: "pollo-frito-al-estilo-coreano.webp"
    },
    {
        id: "bulgogi",
        name: "Bulgogi (불고기)",
        category: "platos",
        price: 45000,
        description: "Finas y tiernas tiras de carne vacuna marinadas en salsa de soja, ajo y aceite de sésamo. Salteadas al wok con cebolla y verduras. Incluye porción de arroz blanco.",
        spicy: 0,
        badge: "Clásico",
        image: "bulgogi.jpg"
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
