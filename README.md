# 🇰🇷 KIMCHI FOOD - Sitio Web Premium E-Business

¡Bienvenido al proyecto e-business de **KIMCHI FOOD**! Esta es una propuesta digital premium diseñada específicamente para un restaurante de comida coreana tradicional operando bajo demanda y a puerta cerrada en la ciudad de **Luque, Paraguay**.

El sitio web destaca por su visual de primer nivel, fluidez móvil, un sistema integrado de carrito de compras que procesa pedidos a WhatsApp y un asistente virtual inteligente ("Kimchi-Bot").

---

## 🎨 Concepto y Línea Visual ("Seoul Night Bistro")
La estética general sigue una línea de diseño moderno inspirado en los bistrós nocturnos de Seúl y el auge del K-Pop y K-Dramas:
- **Acentos Coreanos:** Rojo Gochujang picante, Naranja Kimchi cálido y Negro Carbón de fondo.
- **Glassmorphism:** Paneles traslúcidos con desenfoque de fondo para dar elegancia.
- **Micro-animaciones:** Efectos de levitación en tarjetas de comida, botones flotantes con pulsación de neón y cargadores dinámicos.
- **Tipografía:** *Outfit* para encabezados vanguardistas e *Inter* para el cuerpo de texto, logrando una legibilidad impecable.

---

## 📁 Estructura del Proyecto
El proyecto ha sido estructurado siguiendo las mejores prácticas de modularidad y escalabilidad en el frontend:

```text
kimchifood/
│
├── index.html                   # Estructura principal y maquetación semántica HTML5
├── README.md                    # Este documento informativo escolar
│
├── css/
│   ├── variables.css            # Tokens de diseño (colores, fuentes, gradientes, sombras)
│   ├── main.css                 # Estilos globales, tipografía y pie de página responsivos
│   ├── components.css           # Botones, cajón deslizante de carrito y widget de chatbot
│   └── sections.css             # Secciones específicas: Inicio, Nosotros, Productos, Tienda y Contacto
│
├── js/
│   ├── app.js                   # Inicializador general, carruseles de banners y filtros de menú
│   ├── menu.js                  # Base de datos de platos con precios competitivos en Guaraníes (Gs.)
│   ├── cart.js                  # Manejo del carrito de compras y validador de fecha de entrega
│   └── chatbot.js               # Chatbot de IA con motor de NLU local inteligente 100% offline
│
└── assets/                      # Identidad de marca y banners promocionales del restaurante
    ├── kimchifood.png           # Logo caricatura oficial de la mascota Kimchi
    ├── promo-lunes-food.png     # Banner promocional: Lunes K-Drama (10% OFF)
    ├── miercoles-food.png       # Banner promocional: Miércoles K-Pop (10% OFF)
    └── viernes-food.png         # Banner promocional: Seoul Night Friday (15% OFF)
```

---

## 🌟 Características Clave del E-Business

### 1. Estructura de Presentación Digital
La navegación y el contenido se estructuran de forma inmersiva respetando las pautas académicas exigidas por el docente:
- 🏠 **Inicio (Home):** Hero interactivo con eslogan llamativo y carrusel automático de ofertas del día.
- 👥 **Nosotros (About):** Explicación del modelo de negocio por demanda ("Ghost Kitchen"), justificación del pedido anticipado de 24hs para la máxima frescura artesanal y horarios operativos.
- 🍛 **Productos (Showcase):** Galería con filtros rápidos e interactivos para conocer a fondo los platillos y sus ingredientes.
- 🛒 **Tienda (Store):** Catálogo interactivo de compras en tiempo real con sistema de carrito y calculadora inteligente.
- 📞 **Contacto (Contact):** Información de contacto, formulario de mensajería y mapa interactivo integrado de Luque, Paraguay.

### 2. Motor de Descuento Automatizado por Día
La tienda calcula y aplica automáticamente los descuentos representados en las promociones cuando el cliente elige la fecha de su pedido en el formulario:
- **Entrega elegida para un Lunes:** Aplica automáticamente un **10% de descuento** sobre los platos (Promoción K-Drama).
- **Entrega elegida para un Miércoles:** Aplica automáticamente un **10% de descuento** sobre los platos (Promoción K-Pop).
- **Entrega elegida para un Viernes:** Aplica automáticamente un **15% de descuento** sobre los platos (Promoción Seoul Night).
- *(Cualquier otro día no disponible de entrega es rechazado por el validador, instruyendo al usuario a elegir un día habilitado).*

### 3. Cajón de Carrito y Checkout de WhatsApp
- El estado del carrito se persiste de forma local mediante `localStorage`, asegurando que no se pierdan los artículos al recargar o navegar en la web.
- Al completar los datos, el botón de pago recopila la información del pedido de forma estructurada con emojis, método de pago y desglose de precios, y lo redirige automáticamente a la API de WhatsApp al número del restaurante (`+595991522885`).

### 4. Chatbot "Kimchi-Bot AI" Inteligente Offline
Para brindar una experiencia inmersiva y un soporte automatizado veloz al cliente, el widget flotante de Kimchi-Bot cuenta con:
- **Motor Local de NLU:** Corre un procesador local de coincidencia semántica en español muy refinado que responde con humor y dinamismo, simulando ser una inteligencia artificial en vivo.
- **Soporte Temático Estricto:** Está limitado de forma estricta a responder dudas sobre el menú, precios competitivos, horarios de reparto de Lu, Mi, Vi y la ubicación de retiro en Luque, Paraguay, ayudando al cliente en su decisión de compra.

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

1. Abre el archivo `index.html` haciendo doble clic desde el explorador de archivos en cualquier navegador (Chrome, Edge, Firefox, Brave, Safari).
2. Para una experiencia óptima y simulación fluida, puedes correr un servidor local ligero:
   ```bash
   # Si cuentas con Node.js instalado
   npx serve .
   ```
3. ¡Chatea con **Kimchi-Bot** en la esquina inferior derecha! Hazle preguntas de menús, precios, horarios y de cómo realizar pedidos para asombrar a tu docente con un asistente interactivo de marca sumamente inmersivo e inmediato.
"# kimchifood" 
