/* AI CHATBOT LOGIC ("KIMCHI-BOT") - KIMCHI FOOD */

// DOM Elements cache
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const toggleChatBtn = document.getElementById('toggleChatBtn');
const chatCloseBtn = document.getElementById('chatCloseBtn');

// Keep track of chatbot conversation state
let chatState = {
    lastIntent: null,       // Stores the last matched intent to resolve follow-ups
    lastProduct: null,      // Stores the last discussed product ID
    messageCount: 0
};

// Comprehensive product details database for context-specific queries
const PRODUCT_DETAILS = {
    "kimbap-bulgogi": {
        name: "Kimbap Tradicional de Bulgogi",
        price: "30.000 Gs.",
        ingredients: "Carne de res marinada en salsa de soja dulce (bulgogi), espinaca salteada, zanahoria crujiente, tortilla de huevo y rábano amarillo encurtido coreano (danmuji), enrollados herméticamente en arroz y alga nori con aceite de sésamo.",
        vegOption: "Podemos prepararlo sin carne (versión vegetariana) a solicitud en las notas de tu pedido.",
        spicy: "No es picante (0/5 en la escala de picante). Excelente para todas las edades."
    },
    "tteokbokki-clasico": {
        name: "Tteokbokki Clásico Picante",
        price: "35.000 Gs.",
        ingredients: "Pasteles de arroz cilíndricos tradicionales sumamente elásticos (tteok), láminas de pastel de pescado sazonado (eomuk) y cebollitas de verdeo, salteados en una reducción picante y dulce a base de gochujang y chile coreano (gochugaru).",
        vegOption: "Contiene pastel de pescado tradicional. Si eres vegetariano, nos puedes avisar para sustituirlo por vegetales adicionales o doble de pasteles de arroz.",
        spicy: "Tiene un nivel de picante medio-alto (3/5 en la escala de picante), ideal para amantes de las sensaciones intensas."
    },
    "tteokbokki-queso": {
        name: "Tteokbokki Especial con Queso",
        price: "40.000 Gs.",
        ingredients: "Nuestros clásicos pasteles de arroz picantes (tteokbokki) cubiertos de una densa capa de queso mozzarella premium derretido y sopleteado para darle un toque ahumado exquisito.",
        vegOption: "Contiene pastel de pescado tradicional en su salsa base. Podemos adaptarlo a vegetariano si nos indicas por WhatsApp.",
        spicy: "El queso mozzarella suaviza notablemente el picante, reduciéndolo a un nivel medio (2/5 en la escala de picante)."
    },
    "bibimbap-bowl": {
        name: "Bibimbap Bowl Premium",
        price: "45.000 Gs.",
        ingredients: "Una base de arroz blanco al vapor coronada con montañas ordenadas de espinacas sazonadas, brotes de soja frescos, zanahorias salteadas, calabacín, hongos salteados, carne molida marinada bulgogi y un huevo frito con yema tierna. Servido con pasta gochujang aparte para mezclar.",
        vegOption: "¡Súper fácil de hacer 100% vegetariano! Solo indícanos retirar la carne en las notas del checkout.",
        spicy: "El picante lo controlas tú por completo, ya que la salsa gochujang se sirve en un recipiente aparte para que le agregues a tu gusto."
    },
    "ramen-especial": {
        name: "Ramen Coreano Especial",
        price: "30.000 Gs.",
        ingredients: "Fideos coreanos ramyun de textura gruesa en caldo picante y reconfortante de carne y vegetales, acompañados de huevo marinado en soja con yema cremosa, alga nori crujiente, verdeo fresco y una porción de kimchi artesanal.",
        vegOption: "El caldo base es de extracto de carne y mariscos, por lo que no es apto para vegetarianos estrictos.",
        spicy: "Nivel de picante medio-alto (3/5 en la escala de picante). ¡Te hará entrar en calor de inmediato!"
    },
    "mandu-frito": {
        name: "Mandu Crujientes (6 uds.)",
        price: "28.000 Gs.",
        ingredients: "Empanaditas de masa ultra fina rellenas con carne de cerdo picada de primera, fideos de celofán transparentes y cebollino de ajo. Doradas y crujientes a la plancha, servidas con salsa de soja y vinagre cítrico ponzu.",
        vegOption: "Contiene carne de cerdo seleccionada en el relleno de la masa.",
        spicy: "No es picante (0/5 en la escala de picante). Acompañamiento perfecto para cualquier comida."
    },
    "kimchi-pote": {
        name: "Kimchi Artesanal (Pote 500g)",
        price: "25.000 Gs.",
        ingredients: "Repollo coreano fermentado artesanalmente durante semanas con pasta de gochugaru (chile coreano), ajo, jengibre fresco, salsa de pescado y verdeo. Envasado herméticamente al vacío para madurar en tu heladera.",
        vegOption: "Contiene salsa de pescado en la fermentación tradicional coreana.",
        spicy: "Nivel de picante alto y refrescante (4/5 en la escala de picante). Lleno de probióticos saludables."
    }
};

// Clean and normalize text for robust string matching (removes accents, punctuation)
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\u00bf\u00a1]/g, " ") // Replace punctuation with space
        .replace(/\s+/g, " ") // Collapse spaces
        .trim();
}

// Check how many words overlap between user tokens and keyword arrays
function calculateOverlapScore(userWords, keywords) {
    let score = 0;
    keywords.forEach(keyword => {
        const normalizedKeyword = normalizeText(keyword);
        if (normalizedKeyword.includes(" ")) {
            // Phrase match
            if (userWords.join(" ").includes(normalizedKeyword)) {
                score += 3.0; // Higher weight for phrase matches
            }
        } else {
            // Word match
            userWords.forEach(word => {
                if (word === normalizedKeyword) {
                    score += 1.0;
                } else if (word.length > 4 && normalizedKeyword.length > 4) {
                    // Check for partial match (like plurals or basic typos)
                    if (word.includes(normalizedKeyword) || normalizedKeyword.includes(word)) {
                        score += 0.6;
                    }
                }
            });
        }
    });
    return score;
}

// Gather all environment context from the DOM, LocalStorage and Date
function gatherSystemContext() {
    // 1. Get active section name from the navbar highlight
    const activeNavLink = document.querySelector('.nav-link.active');
    const activeSection = activeNavLink ? activeNavLink.getAttribute('href').replace('#', '') : 'inicio';
    
    // 2. Get cart data from localStorage
    let cartItems = [];
    try {
        cartItems = JSON.parse(localStorage.getItem('kimchi_cart')) || [];
    } catch (e) {}
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    // 3. Get checkout form fields if open in DOM
    const checkoutOpen = document.getElementById('checkoutModal')?.classList.contains('open') || false;
    const clientName = document.getElementById('clientName')?.value || '';
    const clientAddress = document.getElementById('clientAddress')?.value || '';
    const clientPhone = document.getElementById('clientPhone')?.value || '';
    const deliveryDate = document.getElementById('deliveryDate')?.value || '';
    const paymentMethod = document.getElementById('paymentMethod')?.value || '';
    
    // 4. Get current time and day
    const now = new Date();
    const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const currentWeekday = weekdays[now.getDay()];
    const currentHour = now.getHours();
    
    return {
        activeSection,
        cartItems,
        cartCount,
        cartSubtotal,
        checkoutOpen,
        clientName,
        clientAddress,
        clientPhone,
        deliveryDate,
        paymentMethod,
        currentWeekday,
        currentHour
    };
}

// Helper to format cart quantities in a user-friendly text
function getCartCountText(context) {
    if (context.cartCount === 0) return "tu carrito está vacío";
    return `**${context.cartCount}** unidad(es) con un subtotal de **${new Intl.NumberFormat('es-PY').format(context.cartSubtotal)} Gs.**`;
}

// Generate real-time summary of the user's shopping cart
function getCartStatusSummary() {
    let activeCart = [];
    try {
        activeCart = JSON.parse(localStorage.getItem('kimchi_cart')) || [];
    } catch (e) {
        activeCart = [];
    }

    if (activeCart.length === 0) {
        return `🛒 Tu carrito de compras actual está **vacío**. <br><br>¡Puedes ir a la sección de **Menú & Tienda** en nuestra web, filtrar por categoría y presionar el botón **"+ Añadir"** para armar tu combo coreano! Si te da sed, tenemos excelentes recomendaciones tradicionales.`;
    }

    let summaryText = `🛒 **Tu Carrito de compras actual:**<br><br>`;
    let subtotal = 0;
    activeCart.forEach((item, index) => {
        const itemCost = item.product.price * item.quantity;
        subtotal += itemCost;
        summaryText += `${index + 1}. **${item.quantity}x ${item.product.name}** (${new Intl.NumberFormat('es-PY').format(itemCost)} Gs.)<br>`;
    });

    summaryText += `<br>💵 **Subtotal de Platos:** ${new Intl.NumberFormat('es-PY').format(subtotal)} Gs.<br>`;
    summaryText += `🚚 **Delivery Fijo (Luque/Central):** 10.000 Gs.<br><br>`;
    
    // Check if they have a date selected to display exact discount
    const dateInput = document.getElementById('deliveryDate');
    const selectedDateVal = dateInput ? dateInput.value : '';
    if (selectedDateVal) {
        const dateObj = new Date(selectedDateVal + 'T00:00:00');
        const dayOfWeek = dateObj.getDay();
        let discountPercent = 0;
        let discountName = "";
        
        if (dayOfWeek === 1) {
            discountPercent = 0.10;
            discountName = "10% de Descuento por Lunes K-Drama 🎬";
        } else if (dayOfWeek === 3) {
            discountPercent = 0.10;
            discountName = "10% de Descuento por Miércoles K-POP 🎵";
        } else if (dayOfWeek === 5) {
            discountPercent = 0.15;
            discountName = "15% de Descuento por Viernes Seoul Night 🌌";
        }
        
        if (discountPercent > 0) {
            const discountAmount = subtotal * discountPercent;
            const finalTotal = subtotal - discountAmount + 10000;
            summaryText += `🎁 **Descuento Aplicado:** -${new Intl.NumberFormat('es-PY').format(discountAmount)} Gs. (${discountName})<br>`;
            summaryText += `💰 **TOTAL ESTIMADO CON ENVÍO:** **${new Intl.NumberFormat('es-PY').format(finalTotal)} Gs.**<br>`;
            return summaryText;
        }
    }
    
    summaryText += `💡 *Tip del Chef:* Al realizar tu checkout e ingresar la fecha de entrega, si seleccionas un **Lunes, Miércoles o Viernes**, el sistema aplicará automáticamente **entre el 10% y el 15% de descuento** sobre tus platos. ¡Pruébalo!`;

    return summaryText;
}

// Find a product in the user message based on keywords
function findProductInMessage(cleanMsg) {
    if (cleanMsg.includes("queso") || cleanMsg.includes("mozzarela") || cleanMsg.includes("mozzarella") || cleanMsg.includes("tteokbokki con queso") || cleanMsg.includes("tteokbokki queso")) {
        return "tteokbokki-queso";
    }
    if (cleanMsg.includes("kimbap") || cleanMsg.includes("quimbap") || cleanMsg.includes("gimbap") || cleanMsg.includes("bulgogi") || cleanMsg.includes("rollo")) {
        return "kimbap-bulgogi";
    }
    if (cleanMsg.includes("tteokbokki") || cleanMsg.includes("toktoki") || cleanMsg.includes("pasteles de arroz") || cleanMsg.includes("arroz picante")) {
        return "tteokbokki-clasico";
    }
    if (cleanMsg.includes("bibimbap") || cleanMsg.includes("bivimbap") || cleanMsg.includes("bowl") || cleanMsg.includes("cuenco")) {
        return "bibimbap-bowl";
    }
    if (cleanMsg.includes("ramen") || cleanMsg.includes("ramyun") || cleanMsg.includes("sopa") || cleanMsg.includes("fideos")) {
        return "ramen-especial";
    }
    if (cleanMsg.includes("mandu") || cleanMsg.includes("mandus") || cleanMsg.includes("empanada") || cleanMsg.includes("gyoza")) {
        return "mandu-frito";
    }
    if (cleanMsg.includes("kimchi") || cleanMsg.includes("pote") || cleanMsg.includes("envasado") || cleanMsg.includes("conserva")) {
        return "kimchi-pote";
    }
    return null;
}

// Smart NLU engine with context resolution and dynamic replies
function generateIntelligentResponse(userMsg) {
    const cleanMsg = normalizeText(userMsg);
    const userWords = cleanMsg.split(" ");
    
    // Gather real-time context
    const context = gatherSystemContext();
    
    // UPDATE STATE: If a product is mentioned in the message, register it in chatState
    const currentProductMention = findProductInMessage(cleanMsg);
    if (currentProductMention) {
        chatState.lastProduct = currentProductMention;
    }

    // --- CONTEXTUAL TRIGGERS & ACTIONS ---
    
    // 1. Direct Visual Action Triggers (Scrolling & Open panels)
    
    // A. Cart Opening
    if (cleanMsg.includes("abrir carrito") || cleanMsg.includes("ver carrito") || cleanMsg.includes("mostrar carrito") || cleanMsg.includes("ver mi carrito") || cleanMsg.includes("abrir mi carrito") || cleanMsg.includes("mi bolsa") || cleanMsg.includes("abrir bolsa")) {
        if (typeof openCartDrawer === 'function') {
            openCartDrawer();
            return `🛒 ¡Por supuesto! He abierto tu panel lateral de compras. Aquí puedes visualizar todos los platos cargados, ajustar las unidades o proceder a agendar el delivery. Actualmente tu carrito cuenta con ${getCartCountText(context)}.`;
        }
    }
    
    // B. Cart Closing
    if (cleanMsg.includes("cerrar carrito") || cleanMsg.includes("ocultar carrito") || cleanMsg.includes("cerrar mi carrito")) {
        if (typeof closeCartDrawer === 'function') {
            closeCartDrawer();
            return `Listo. He cerrado y ocultado tu panel de compras para que puedas seguir visualizando el menú cómodamente.`;
        }
    }
    
    // C. Checkout Modal Opening
    if (cleanMsg.includes("completar pedido") || cleanMsg.includes("hacer checkout") || cleanMsg.includes("ir a pagar") || cleanMsg.includes("finalizar compra") || cleanMsg.includes("comprar ya") || cleanMsg.includes("confirmar compra") || cleanMsg.includes("abrir checkout") || cleanMsg.includes("completar compra")) {
        if (context.cartCount === 0) {
            return `🤔 Tu carrito está actualmente vacío. Para poder abrir la pantalla de checkout y hacer tu pedido, primero debes agregar alguna delicia coreana. ¡Dime qué plato deseas y yo mismo lo cargo por ti!`;
        }
        if (typeof openCheckoutModal === 'function') {
            openCheckoutModal();
            return `🥢 ¡Perfecto! He abierto la pantalla de checkout para ti. Por favor, completa tu Nombre, Dirección de Luque o Central, Método de Pago y la Fecha de Entrega (recuerda que cocinamos con 24 horas de antelación y entregamos los Lunes, Miércoles y Viernes). ¡Al dar Confirmar se compilará todo vía WhatsApp!`;
        }
    }
    
    // D. Clear Cart Action
    if (cleanMsg.includes("vaciar carrito") || cleanMsg.includes("limpiar carrito") || cleanMsg.includes("borrar todo el carrito") || cleanMsg.includes("vaciar mi pedido") || cleanMsg.includes("borrar mi carrito")) {
        if (typeof cart !== 'undefined' && typeof updateCart === 'function') {
            cart = [];
            updateCart();
            return `🛒 He vaciado completamente tu carrito de compras. Todos los platos han sido retirados. ¿Con cuál de nuestras delicias tradicionales te gustaría volver a empezar hoy?`;
        }
    }
    
    // E. Scroll to Contact Section
    if (cleanMsg.includes("ir a contacto") || cleanMsg.includes("ver contacto") || cleanMsg.includes("donde estan ubicados") || cleanMsg.includes("como llego") || cleanMsg.includes("ver el mapa") || cleanMsg.includes("escribir un correo") || cleanMsg.includes("enviar mensaje") || cleanMsg.includes("ver telefono") || cleanMsg.includes("redes sociales")) {
        const contactSection = document.getElementById('contacto');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            return `📍 Te he desplazado suavemente hasta nuestra sección de **Contacto**. <br><br>Aquí puedes rellenar nuestro formulario de consultas a la derecha, o interactuar con el mapa digital en Ignacio A. Pane 140, Luque. Nuestro WhatsApp es **0991 522 885** y nuestro Instagram oficial es **@kimchifoodrestaurantepy**.`;
        }
    }
    
    // F. Scroll to Nosotros Section
    if (cleanMsg.includes("quienes son") || cleanMsg.includes("sobre nosotros") || cleanMsg.includes("ir a nosotros") || cleanMsg.includes("ver nosotros") || cleanMsg.includes("historia") || cleanMsg.includes("como funciona la cocina") || cleanMsg.includes("ghost kitchen") || cleanMsg.includes("cocina fantasma") || cleanMsg.includes("ver mascota")) {
        const aboutSection = document.getElementById('nosotros');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
            return `🥢 Te he llevado a nuestra sección de **Nosotros**.<br><br>Aquí explicamos en detalle nuestra modalidad de *Ghost Kitchen* (cocina a puertas cerradas sin salón físico en Luque). Elaboramos cada comida artesanalmente al recibir tu encargo con **24 horas de anticipación** para asegurar las texturas y el sabor tradicional de Seúl. ¡También verás a nuestra simpática mascota del Kimchi!`;
        }
    }

    // G. Scroll to Menu/Tienda Section
    if (cleanMsg.includes("ir al menu") || cleanMsg.includes("ver el menu") || cleanMsg.includes("ver la tienda") || cleanMsg.includes("tienda digital") || cleanMsg.includes("ver platos") || cleanMsg.includes("todos los platos") || cleanMsg.includes("filtrar categorias") || cleanMsg.includes("comida coreana")) {
        const storeSection = document.getElementById('tienda');
        if (storeSection) {
            storeSection.scrollIntoView({ behavior: 'smooth' });
            return `🛒 ¡Listo! Te he llevado a nuestra sección unificada de **Menú & Tienda**. <br><br>Aquí tienes todas nuestras joyas culinarias a la vista. Puedes utilizar las pestañas para filtrar por **Entradas**, **Platos Fuertes** o **Potes Envasados**, y añadir cualquier producto directamente al carrito con el botón **"+ Añadir"**.`;
        }
    }

    // 2. Direct ADD to Cart action
    const isAdding = cleanMsg.includes("agregar") || cleanMsg.includes("añadir") || cleanMsg.includes("poner") || cleanMsg.includes("cargar") || cleanMsg.includes("pedir") || cleanMsg.includes("comprar") || cleanMsg.includes("ordenar") || cleanMsg.includes("suma");
    if (isAdding) {
        const productToLoad = chatState.lastProduct;
        if (productToLoad && PRODUCT_DETAILS[productToLoad] && typeof addToCart === 'function') {
            addToCart(productToLoad);
            const pDetails = PRODUCT_DETAILS[productToLoad];
            // Re-gather system context after addition
            const updatedContext = gatherSystemContext();
            return `🛒 ¡Hecho! He añadido **${pDetails.name}** a tu carrito de compras de inmediato. <br><br>Actualmente tu pedido cuenta con ${getCartCountText(updatedContext)}.<br><br>¿Te gustaría abrir el carrito para revisarlo, realizar el checkout o prefieres que te hable de algún otro plato tradicional?`;
        } else {
            return `🤔 Veo que deseas agregar un plato a tu pedido. ¿Podrías indicarme exactamente cuál de nuestras delicias tradicionales te gustaría cargar? (Kimbap, Ramen, Tteokbokki Clásico, Tteokbokki con Queso, Bibimbap, Mandu o Pote de Kimchi). ¡Escribe el nombre y lo agregaré al instante!`;
        }
    }

    // 3. Pronoun references & contextual product questions
    // If the user asks for specific aspects of the recently discussed or matched product
    const contextProduct = chatState.lastProduct;
    if (contextProduct && PRODUCT_DETAILS[contextProduct]) {
        const prod = PRODUCT_DETAILS[contextProduct];
        
        // A. Price queries
        if (cleanMsg.includes("precio") || cleanMsg.includes("cuesta") || cleanMsg.includes("cuanto") || cleanMsg.includes("gs") || cleanMsg.includes("guarani") || cleanMsg.includes("valor")) {
            return `💰 El precio de **${prod.name}** es de **${prod.price}**.<br><br>Recuerda que si agendas tu entrega para un **Lunes, Miércoles o Viernes**, recibirás un descuento automático del 10% al 15% sobre tus platos. ¿Te gustaría que lo añada a tu carrito ahora mismo?`;
        }
        
        // B. Ingredients queries
        if (cleanMsg.includes("ingrediente") || cleanMsg.includes("lleva") || cleanMsg.includes("que es") || cleanMsg.includes("contiene") || cleanMsg.includes("esta hecho") || cleanMsg.includes("receta")) {
            return `📝 **Ingredientes detallados de ${prod.name}:**<br>${prod.ingredients}<br><br>🌱 *Opción vegetariana:* ${prod.vegOption}`;
        }
        
        // C. Spicy queries
        if (cleanMsg.includes("picante") || cleanMsg.includes("pica") || cleanMsg.includes("chile") || cleanMsg.includes("gochugaru") || cleanMsg.includes("gochujang") || cleanMsg.includes("aji")) {
            return `🌶️ **Nivel de Picante de ${prod.name}:**<br>${prod.spicy}`;
        }
        
        // D. Vegetarian queries
        if (cleanMsg.includes("vegetariano") || cleanMsg.includes("vegano") || cleanMsg.includes("sin carne") || cleanMsg.includes("apto") || cleanMsg.includes("cerdo") || cleanMsg.includes("pescado") || cleanMsg.includes("alergia")) {
            return `🌱 **Información Veg/Alérgenos de ${prod.name}:**<br>${prod.vegOption}<br><br>*Nota:* La salsa o caldo base de algunos de nuestros platos tradicionales utiliza fermentaciones marinas tradicionales. Si tienes alergias severas a mariscos, indícalo al checkout.`;
        }
    }

    // 4. Checkout modal form active context (If user is currently filling out checkout)
    if (context.checkoutOpen) {
        let personalGreeting = context.clientName ? `, **${context.clientName}**` : '';
        
        if (cleanMsg.includes("entrega") || cleanMsg.includes("direccion") || cleanMsg.includes("luque") || cleanMsg.includes("central") || cleanMsg.includes("donde reparten")) {
            return `🚚 Hola${personalGreeting}, veo que estás rellenando tu formulario de entrega. Hacemos envíos rápidos en todo Luque y ciudades de Central con una tarifa plana fija de **10.000 Gs.** (que ya está sumada a tu total). Solo dinos tu dirección exacta en el campo correspondiente.`;
        }
        if (cleanMsg.includes("pago") || cleanMsg.includes("pagar") || cleanMsg.includes("banco") || cleanMsg.includes("sipap") || cleanMsg.includes("transferencia") || cleanMsg.includes("giro") || cleanMsg.includes("efectivo")) {
            return `💳 En el checkout${personalGreeting} puedes elegir 3 métodos cómodos de pago: **Transferencia SIPAP/Bancaria**, **Giros Tigo** o **Efectivo contra entrega**. Elige tu preferido en el selector y cuando envíes el mensaje por WhatsApp, coordinaremos los detalles de facturación.`;
        }
        if (cleanMsg.includes("fecha") || cleanMsg.includes("dias") || cleanMsg.includes("cuando") || cleanMsg.includes("calendario") || cleanMsg.includes("lunes") || cleanMsg.includes("miercoles") || cleanMsg.includes("viernes")) {
            return `📅 Recuerda${personalGreeting} seleccionar una fecha que sea **Lunes, Miércoles o Viernes** y con al menos **24 horas de anticipación**. Nuestro e-business opera así para garantizar la frescura artesanal. ¡Además de que recibirás descuentos fantásticos esos días!`;
        }
        if (cleanMsg.includes("confirmar") || cleanMsg.includes("como envio") || cleanMsg.includes("whatsapp") || cleanMsg.includes("terminar")) {
            return `📱 Al completar todos los campos del checkout${personalGreeting}, presiona el botón verde **'Confirmar Pedido vía WhatsApp'**. Automáticamente se abrirá tu aplicación de WhatsApp con un mensaje perfectamente estructurado con emojis y montos finales para enviárnoslo con un solo clic.`;
        }
    }

    // --- GENERAL INTENTS CONFIGURATION & SCORED MATCHING ---
    const INTENTS = [
        {
            id: "saludo",
            keywords: ["hola", "buenos dias", "buenas tardes", "buenas noches", "saludo", "hey", "annyeong", "aloha", "como estas", "que tal", "quetal"],
            response: `¡Annyeonghaseyo! 🇰🇷✨ Bienvenido a **KIMCHI FOOD**, tu bistró coreano digital en Luque. <br><br>Soy **Kimchi-Bot AI**, tu chef virtual y asistente. Hoy es un excelente día para planificar tu menú tradicional. <br><br>💡 *Contexto actual:* Tu carrito cuenta actualmente con **${getCartCountText(context)}**. Estamos cocinando para entregar los días **Lunes, Miércoles y Viernes de 18:00 a 00:00** (24h de anticipación). <br><br>¿En qué delicia tradicional o consulta sobre delivery te puedo orientar hoy? 🥢`
        },
        {
            id: "menu_general",
            keywords: ["menu", "platos", "comida", "carta", "quieren ofrecer", "opciones", "que venden", "que tienen", "hacen", "lista de precios", "carta de precios", "variedad"],
            response: `¡Qué delicia! Elaboramos platos coreanos tradicionales con fermentaciones naturales y productos importados de primera en Luque. <br><br>Aquí tienes nuestra selección exclusiva de joyas gastronómicas:<br><br>
            • 🍚 **Kimbap Tradicional de Bulgogi:** 30.000 Gs. (10 piezas gigantes rellenas de carne marinada bulgogi, vegetales y huevo).<br>
            • 🌶️ **Tteokbokki Clásico Picante:** 35.000 Gs. (Pasteles de arroz y láminas de eomuk en reducción dulce-picante).<br>
            • 🧀 **Tteokbokki con Queso:** 40.000 Gs. (Nuestra versión insignia gratinada con abundante mozzarella sopleteada).<br>
            • 🍳 **Bibimbap Bowl Premium:** 45.000 Gs. (Arroz, 5 vegetales salteados sazonados, bulgogi de res, huevo frito y pasta gochujang aparte).<br>
            • 🍜 **Ramen Coreano Especial:** 30.000 Gs. (Caldo picante de carne/mariscos con fideos gruesos, huevo y verdeo. Acompañado de kimchi).<br>
            • 🥟 **Mandu Crujientes (6 uds.):** 28.000 Gs. (Empanaditas crujientes de cerdo, fideos celofán y cebollino).<br>
            • 🥬 **Kimchi Artesanal (Pote 500g):** 25.000 Gs. (Fermentado tradicional envasado al vacío listo para consumir en tu heladera).<br><br>
            *¡Puedes filtrarlos por categoría y añadirlos al carrito directamente en la sección unificada de **Menú & Tienda** en esta misma página! Si quieres que cargue alguno por ti, solo dime: "Agrega el ramen" y lo haré al instante.*`
        },
        {
            id: "kimbap",
            keywords: ["kimbap", "quimbap", "gimbap", "bulgogi", "rollo", "arroz envuelto", "alga", "nori"],
            productId: "kimbap-bulgogi",
            response: `🍙 **Kimbap Tradicional de Bulgogi (30.000 Gs. - 10 piezas gigantes):**<br>
            Es el rollo de arroz coreano por excelencia. Enrollamos alga nori y arroz sazonado con aceite de sésamo premium, relleno con carne de res marinada en salsa de soja dulce (bulgogi), huevo, espinacas y zanahorias salteadas, y el toque ácido del danmuji (rábano amarillo encurtido coreano).<br><br>
            • **Nivel de picante:** 0/5 (Ninguno).<br>
            • **¿Deseas agregarlo a tu pedido?** Escribe *"Añádelo"* o *"Agregar"* y lo cargaré a tu carrito de inmediato.`
        },
        {
            id: "tteokbokki",
            keywords: ["tteokbokki", "toktoki", "pasteles de arroz", "eomuk", "pastel de pescado", "masa de arroz", "cilindros"],
            productId: "tteokbokki-clasico",
            response: `🌶️ **Tteokbokki Clásico Picante (35.000 Gs.):**<br>
            Consiste en tiernos cilindros de pastel de arroz glutinoso (tteok) de textura chiclosa adictiva, cocinados junto a finas láminas de pastel de pescado (eomuk) en una salsa reduction dulce y picante a base de gochujang. Servido con verdeo fresco y sésamo.<br><br>
            • **Nivel de picante:** 3/5 (Medio-Alto).<br>
            • **¿Quieres pedirlo?** Escribe *"Agregar"* o *"Quiero probarlo"* para cargarlo a tu orden.`
        },
        {
            id: "tteokbokki_queso",
            keywords: ["tteokbokki con queso", "tteokbokki queso", "queso mozzarella", "mozzarella fundido", "toktoki queso", "gratinado"],
            productId: "tteokbokki-queso",
            response: `🧀 **Tteokbokki Especial con Queso (40.000 Gs.):**<br>
            Tomamos nuestra base clásica de pasteles de arroz glutinoso en salsa dulce-picante de gochujang y la coronamos con una abundante capa de queso mozzarella premium fundido y sopleteado al momento. Esto suaviza el picante y crea hilos de queso espectaculares.<br><br>
            • **Nivel de picante:** 2/5 (Medio).<br>
            • **¿Te gustaría agregarlo a tu carrito ahora mismo?** Escribe *"Agregar"* y lo haré.`
        },
        {
            id: "bibimbap",
            keywords: ["bibimbap", "bivimbap", "bowl", "cuenco", "arroz mezclado", "vegetales", "hongos"],
            productId: "bibimbap-bowl",
            response: `🍳 **Bibimbap Bowl Premium (45.000 Gs.):**<br>
            Significa literalmente 'arroz mezclado'. Es un cuenco de arroz blanco cubierto artísticamente con espinacas sazonadas, brotes de soja frescos, zanahorias salteadas, calabacín, champiñones, carne molida marinada bulgogi y un huevo frito. Se mezcla todo junto con pasta gochujang (que va aparte para que regules el picante).<br><br>
            • **Nivel de picante:** Variable (1/5 a 3/5, tú lo controlas).<br>
            • **Vegetarianos:** Súper fácil de hacer 100% veggie retirando la carne.`
        },
        {
            id: "ramen",
            keywords: ["ramen", "ramyun", "sopa", "caldo", "fideos picantes", "noodle"],
            productId: "ramen-especial",
            response: `🍜 **Ramen Coreano Especial (30.000 Gs.):**<br>
            Fideos ramyun gruesos y elásticos en caldo picante y concentrado tradicional de carne y mariscos, acompañados de huevo marinado en soja, alga nori crujiente, verdeo fresco y una porción de nuestro kimchi artesanal recién elaborado.<br><br>
            • **Nivel de picante:** 3/5 (Medio-Alto). ¡Perfecto para calentar el cuerpo!<br>
            • Escribe *"Agregar Ramen"* para sumarlo a tu pedido de inmediato.`
        },
        {
            id: "mandu",
            keywords: ["mandu", "mandus", "empanadita", "gyoza", "cerdo", "empanadas coreanas", "crujientes"],
            productId: "mandu-frito",
            response: `🥟 **Mandu Crujientes (6 uds. - 28.000 Gs.):**<br>
            Nuestras empanadas artesanales de masa ultra delgada rellenas con carne de cerdo seleccionada picada, fideos de celofán transparentes y cebollinos. Se doran en sartén logrando texturas crocantes y suaves a la vez. Servidas con salsa ponzu cítrica.<br><br>
            • **Nivel de picante:** 0/5 (Ninguno). Acompañante crocante ideal.`
        },
        {
            id: "kimchi",
            keywords: ["kimchi", "pote", "fermentado", "repollo", "conserva", "artesanal", "envasado", "saludable", "probioticos"],
            productId: "kimchi-pote",
            response: `🥬 **Kimchi Artesanal (Pote 500g - 25.000 Gs.):**<br>
            El superalimento y guarnición coreana por excelencia. Repollo fermentado artesanalmente durante semanas con pasta de gochugaru, ajo, jengibre fresco, salsa de pescado y verdeo. Envasado al vacío listo para consumir o cocinar arroz frito.<br><br>
            • **Nivel de picante:** 4/5 (Picante refrescante e intenso).<br>
            • Ideal para tener en tu heladera. Escribe *"Agregar Kimchi"* para cargarlo.`
        },
        {
            id: "veggie",
            keywords: ["vegetariano", "vegano", "sin carne", "sin cerdo", "verdura", "saludable", "restriccion", "alergenos", "apto"],
            response: `🌱 **Opciones Vegetarianas e Ingredientes:**<br>
            ¡Nos encanta adaptar nuestra cocina a tus necesidades!<br><br>
            1. **Bibimbap Bowl (45.000 Gs.):** Podemos prepararlo 100% vegetariano retirando la carne bulgogi. Sigue aportando excelente proteína gracias al huevo frito y los hongos.<br>
            2. **Kimbap Tradicional (30.000 Gs.):** Se puede pedir sin la carne bulgogi, manteniendo el huevo, arroz y sus variados vegetales.<br><br>
            *Nota Importante:* El Kimchi envasado, los Tteokbokki tradicionales y el Ramen utilizan caldos base con extracto de pescado o mariscos. Avísanos en las notas de WhatsApp si tienes alguna alergia severa para tomar cuidados adicionales.`
        },
        {
            id: "pedir_como",
            keywords: ["como pedir", "hacer pedido", "como hago", "ordenar", "comprar", "encargar", "whatsapp", "delivery", "entrega", "luque", "central", "enviar", "checkout"],
            response: `📱 **¿Cómo realizar tu pedido en KIMCHI FOOD?**<br><br>
            ¡Es sumamente intuitivo y rápido! Todo el proceso es frontend:<br><br>
            1. Desplázate a la sección **Menú & Tienda** en esta misma página.<br>
            2. Selecciona las delicias que prefieras y presiona **"+ Añadir"** para cargarlos a tu carrito.<br>
            3. Haz clic en el botón de **bolsa de compras** en la parte superior para abrir tu carrito.<br>
            4. Presiona **"Confirmar Pedido"** e ingresa tus datos (Nombre, dirección en Luque/Central, método de pago y fecha).<br>
            5. *Importante:* Cocinamos bajo demanda, por lo que requerimos **24 horas de anticipación** y entregamos exclusivamente **Lunes, Miércoles y Viernes de 18:00 a 00:00 hs**.<br>
            6. Al dar enviar, se abrirá WhatsApp con tu pedido perfectamente formateado con emojis para finalizar. ¡Y listo!`
        },
        {
            id: "horarios",
            keywords: ["horario", "cuando abren", "que dias", "se reparte", "entregan", "dias de entrega", "dias de reparto", "anticipacion", "horas", "tiempo de espera", "lunes", "miercoles", "viernes"],
            response: `⏰ **Esquema de Cocina y Entregas (Bajo Demanda):**<br><br>
            Para garantizar la frescura absoluta de cada ingrediente coreano, no trabajamos con comida pre-cocinada ni local físico tradicional. Operamos bajo las siguientes reglas:<br><br>
            • **Días de Entrega habilitados:** Lunes, Miércoles y Viernes.<br>
            • **Horario de Delivery:** De 18:00 a 00:00 hs.<br>
            • **Antelación de Reserva:** Mínimo **24 horas de anticipación**. El sistema de la web bloquea pedidos para el mismo día para asegurar la calidad de la cocción.<br><br>
            *¡Agendar tus entregas para estos días te da acceso a fabulosos descuentos automáticos!*`
        },
        {
            id: "ubicacion",
            keywords: ["donde quedan", "donde estan", "local", "fisico", "mesas", "comer ahi", "pane", "luque", "direccion", "ubicacion", "mapa", "sucursal"],
            response: `📍 **Ubicación y Formato de Negocio:**<br><br>
            Nuestra cocina central de preparación está ubicada sobre **Ignacio A. Pane 140, Luque, Central, Paraguay**.<br><br>
            *¿Podemos comer en el local?*<br>
            Actualmente operamos bajo el formato de **Ghost Kitchen (Cocina a puerta cerrada)**. Esto significa que **no tenemos salón comedor, mesas ni atención presencial**. <br><br>
            Trabajamos exclusivamente mediante **Delivery Premium** en Luque y zonas aledañas o con la opción de **Retiro en puerta (Take Away)** de nuestra cocina en la hora acordada por WhatsApp.`
        },
        {
            id: "promos",
            keywords: ["descuento", "promocion", "promociones", "oferta", "descuentos", "rebaja", "k drama", "k drama monday", "k pop", "seoul night"],
            response: `🎁 **Promociones Semanales y Descuentos Automáticos:**<br><br>
            ¡Premiamos tu planificación con ofertas directas en tu carrito según la fecha de entrega que agendes!:<br><br>
            • 🎬 **Lunes K-Drama Monday:** **10% de Descuento** automático en todo el menú. ¡Ideal para maratonear tus series coreanas favoritas con un plato caliente!<br>
            • 🎵 **Miércoles de K-POP:** **10% de Descuento** automático en todo el menú. ¡Sintoniza tus Idols comiendo auténtico Kimbap!<br>
            • 🌌 **Viernes Seoul Night:** **15% de Descuento** automático en todo tu carrito. ¡Comienza el fin de semana disfrutando del sabor vibrante de Seúl!<br><br>
            *¿Cómo funciona?* Solo agrega tus platos al carrito en la pestaña **Menú & Tienda**, coloca una fecha de entrega en el formulario que caiga lunes, miércoles o viernes, y el total se recalculará solo al instante.`
        },
        {
            id: "carrito_status",
            keywords: ["carrito", "mi carro", "que tengo en el carrito", "total de mi compra", "que agregue", "mi pedido", "mis cosas", "cuantos platos llevo", "compras"],
            response: "dynamic_cart_summary" // Will be intercepted to generate live cart data
        },
        {
            id: "despedida",
            keywords: ["gracias", "kamsahamnida", "muchas gracias", "adios", "chao", "hasta luego", "perfecto", "buenisimo", "genial", "ok", "vale", "entendido"],
            response: `¡Kamsahamnida! 🇰🇷✨ Es un verdadero placer ayudarte. <br><br>Si tienes hambre de la mejor comida coreana en Luque, recuerda armar tu carrito en la sección unificada **Menú & Tienda**. Estaré aquí flotando si necesitas saber de ingredientes o métodos de pago. ¡Que tengas un excelente día! 🥢`
        }
    ];

    // STEP 2: General Scored Match using Token Overlap
    let bestIntent = null;
    let highestScore = 0;

    INTENTS.forEach(intent => {
        const score = calculateOverlapScore(userWords, intent.keywords);
        if (score > highestScore) {
            highestScore = score;
            bestIntent = intent;
        }
    });

    // STEP 3: Fallback or Intent routing
    if (bestIntent && highestScore >= 1.0) {
        // Update conversation state
        chatState.lastIntent = bestIntent.id;
        if (bestIntent.productId) {
            chatState.lastProduct = bestIntent.productId;
        }

        // Special handling for dynamic cart query
        if (bestIntent.id === "carrito_status") {
            return getCartStatusSummary();
        }

        return bestIntent.response;
    }

    // STEP 4: Smart Suggestion Fallback (instead of basic "I don't know")
    // See if they mentioned any product name partially
    for (const key in PRODUCT_DETAILS) {
        const prodNameNorm = normalizeText(PRODUCT_DETAILS[key].name);
        if (cleanMsg.includes(key.split("-")[0]) || cleanMsg.includes(key.split("-")[1]) || prodNameNorm.split(" ").some(w => w.length > 4 && cleanMsg.includes(w))) {
            chatState.lastProduct = key;
            const prod = PRODUCT_DETAILS[key];
            return `🤔 Veo que podrías estar preguntando sobre **${prod.name}**.<br><br>• **Precio:** ${prod.price}<br>• **Ingredientes principales:** ${prod.ingredients}<br>• **Nivel de Picante:** ${prod.spicy}<br><br>¿Es esto lo que querías saber? ¡Dime si quieres añadirlo al carrito!`;
        }
    }

    // Default witty response with helpful suggest buttons
    return `🤔 *¡Vaya! No capté del todo esa consulta en mi cocina de Luque.*<br><br>
    Como asistente de **KIMCHI FOOD**, puedo ayudarte de forma exacta con:<br>
    • 📝 Los ingredientes o picante del **Kimbap, Ramen, Tteokbokki o Mandu**.<br>
    • 💰 Saber los **precios en guaraníes** y promociones por día.<br>
    • 🛒 Consultar **qué tienes guardado en tu carrito** actualmente o pedirme que agregue algo escribiendo *"Agregar [plato]"*.<br>
    • ⏰ Recordar las **reglas de 24h de anticipación** y delivery Lu, Mi, Vi.<br><br>
    *¿De cuál de estos temas te gustaría hablar ahora? 🥢*`;
}

// Open / Close Chat Window
function toggleChat() {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
        chatInput.focus();
    }
}

// Render message to UI with profile avatar
function appendMessage(text, sender) {
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${sender}`;
    
    const time = new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    
    // Add micro-avatar profile picture for bot messages
    const avatarHtml = sender === 'bot' 
        ? `<img src="assets/kimchifood.png" alt="Chef Mascot" class="chat-msg-avatar">` 
        : '';
        
    msgEl.innerHTML = `
        ${avatarHtml}
        <div class="chat-msg-content-wrapper">
            <div class="chat-msg-bubble">${text}</div>
            <span class="chat-msg-time">${time}</span>
        </div>
    `;
    
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Display typing indicator
function showTypingIndicator() {
    const indicatorEl = document.createElement('div');
    indicatorEl.className = 'chat-msg bot typing-indicator-container';
    indicatorEl.innerHTML = `
        <img src="assets/kimchifood.png" alt="Chef Mascot" class="chat-msg-avatar">
        <div class="chat-msg-content-wrapper">
            <div class="chat-msg-bubble typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(indicatorEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicatorEl;
}

// Send Message handler
async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Increment message counter
    chatState.messageCount++;
    
    // Add user message to UI
    appendMessage(text, 'user');
    chatInput.value = '';
    
    // Display typing bubble
    const typingIndicator = showTypingIndicator();
    
    // Calculate typing speed delay based on response length for natural simulation
    const responseText = generateIntelligentResponse(text);
    const typingDelay = Math.min(Math.max(responseText.length * 5, 500), 1600); // Throttled to max 1.6s for extreme snappiness
    
    try {
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        // Remove typing indicator and append bot message
        typingIndicator.remove();
        appendMessage(responseText, 'bot');
        
    } catch (error) {
        console.error('Chatbot Error:', error);
        typingIndicator.remove();
        const fallbackMsg = `🇰🇷 ¡Ups! Mi espátula se trabó un segundo. ¿Podrías repetirme eso sobre nuestro delicioso menú o el carrito? 🥢`;
        appendMessage(fallbackMsg, 'bot');
    }
}

// Event Listeners wiring
if (toggleChatBtn) toggleChatBtn.addEventListener('click', toggleChat);
if (chatCloseBtn) chatCloseBtn.addEventListener('click', toggleChat);

if (chatSendBtn) {
    chatSendBtn.addEventListener('click', handleSendMessage);
}

if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}
