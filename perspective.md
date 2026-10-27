# Proyecto 1: Red Social con Integración Meteorológica y Chat Global

| Campo | Detalle |
|---|---|
| **Institución** | Universidad Técnica Nacional (UTN) |
| **Docente** | Milena Vargas Blanco |
| **Valor** | 30% |
| **Fecha de inicio** | 15/10/2026 |
| **Nombre de la carpeta del proyecto** | `Proyecto1-Nombre` (ej. `Proyecto1-Ron`) |

---

## 1. Descripción del proyecto

Diseñar y desarrollar una **plataforma web interactiva que simula una Red Social con integración meteorológica y chat global**.

- La **API pública JSONPlaceholder** simula usuarios, publicaciones y comentarios existentes.
- La **API externa Open-Meteo** provee datos meteorológicos en tiempo real de la ciudad donde se ubica el usuario.

---

## 2. Requisitos técnicos

### 2.1 Stack y restricciones

1. El proyecto debe desarrollarse **íntegramente en TypeScript** (100%).
2. Usar **Node.js con el framework Express.js**.
3. La interfaz de usuario se sirve mediante **plantillas EJS**.
4. Las peticiones a APIs externas se hacen con **Axios o `fetch` nativo**, con **manejo estricto de asincronía (`async/await`)**.
5. **No se utiliza ninguna base de datos.** El almacenamiento de la actividad en vivo es **volátil en memoria RAM**, mediante estructuras de datos de TypeScript (**Arrays, Maps**).

### 2.2 Funcionalidad: feed social (JSONPlaceholder)

6. El sistema debe consultar la API de JSONPlaceholder (`/posts` y `/users`), **mapear la información usando una interfaz `Post` y una interfaz `User`**, y **renderizar las publicaciones en la plantilla EJS combinando título, contenido y nombre del autor**.

### 2.3 Funcionalidad: clima (Open-Meteo)

7. El sistema debe conectarse a la API de **Open-Meteo** para obtener el **clima actual (temperatura y velocidad del viento)** de la ciudad donde se ubica el usuario, **mediante sus coordenadas geográficas**.

### 2.4 Funcionalidad: publicar y tiempo real (WebSockets)

8. El usuario debe poder ingresar **su nombre y un texto** para publicar un nuevo contenido en la red social.
9. Al publicar, el **cliente envía el evento**. El **servidor crea un objeto** con:
   - `id` único
   - nombre del autor
   - contenido
   - hora formateada

   y lo **retransmite en tiempo real a todos los clientes conectados**.
10. El servidor debe **almacenar los nuevos posts en un arreglo en memoria** y **enviarlo al usuario cuando este inicie una nueva conexión WebSocket** (historial).

### 2.5 Arquitectura: separación de responsabilidades

11. El código debe organizarse así:

| Carpeta | Responsabilidad |
|---|---|
| `/services` | Lógica de llamadas a las APIs externas |
| `/routes` | Definición de endpoints de Express |
| `/views` | Plantillas EJS y parciales |
| `/public` | Scripts de cliente y hojas de estilo CSS |

### 2.6 Manejo de errores

12. Si una de las APIs externas (JSONPlaceholder u Open-Meteo) **no responde o falla**, la aplicación **no debe congelarse ni colapsar**. Debe implementar **bloques `try/catch`** y **renderizar mensajes alternativos o amigables en la vista**.

### 2.7 Interfaz

13. La interfaz en EJS debe usar una **maquetación clara organizada en paneles**. Ejemplo:
    - **Panel izquierdo:** Clima
    - **Centro:** Feed Social
    - **Panel derecho:** Chat

### 2.8 Ubicación del usuario por IP

14. Para obtener la ubicación a partir de la IP del usuario se puede usar **una de dos opciones**:

**A. API `ip-api.com`** (sencilla y 100% gratuita)
- La opción más fácil para proyectos educativos y prototipos.
- No requiere registro ni API Key.
- Límite de **45 peticiones por minuto** en la versión gratuita (**HTTP**).

**B. Librería local `geoip-lite`** (sin dependencias externas ni HTTP)
- Lee las ubicaciones desde una base de datos local embebida en el código Node.js.
- Muy rápida: no hace peticiones HTTP a servidores externos.
- Instalación:
  ```bash
  npm install geoip-lite
  npm install -D @types/geoip-lite
  ```

### 2.9 Defensa oral

15. Cada estudiante realiza una **breve defensa oral (5 a 10 minutos)** donde el docente puede solicitar:
    - Explicar el **flujo de datos de una función específica**.
    - Explicar la **diferencia y justificación de las decisiones de diseño** del código entregado.

---

## 3. NOTA IMPORTANTE (uso de IA)

Se permite el uso de IA **como herramienta de apoyo/consulta, pero no como generador total del proyecto**.

Si el estudiante **no es capaz de explicar el funcionamiento línea por línea** del código entregado, o **falla en hacer un ajuste básico en vivo**, el proyecto se considera **no acreditado (calificación 0)**, **aunque el código funcione perfectamente**.

> Implicación práctica para trabajar con Claude Code: el código debe quedar entendible, simple y bien comentado, y el estudiante debe poder explicar y modificar cada parte. Conviene priorizar claridad sobre sofisticación y documentar las decisiones de diseño.

---

## 4. Cuadro evaluativo

Cada aspecto se califica: **Cumple a cabalidad (5 pts)** · **Funciona con deficiencias (3 pts)** · **No funciona o no cumple (0 pts)**.

| # | Aspecto |
|---|---|
| 1 | Adjuntó el proyecto en el tiempo establecido. |
| 2 | Nombró la carpeta del proyecto: `Proyecto1-Nombre`. |
| 3 | Defensa oral y autenticidad. |
| 4 | El proyecto está escrito 100% en TypeScript. |
| 5 | Utiliza Node.js con el framework Express.js. |
| 6 | La interfaz de usuario se hace mediante plantillas EJS. |
| 7 | Consume `/posts` y `/users` mediante Axios/fetch con `async/await`. |
| 8 | Detecta la ubicación del usuario mediante IP. |
| 9 | Consulta automáticamente las coordenadas en la API de Open-Meteo para mostrar temperatura y velocidad del viento. |
| 10 | Permite ingresar nombre y texto para publicar. |
| 11 | El servidor genera id único, autor, contenido y hora formateada. Transmite los posts vía WebSockets a todos los clientes conectados y entrega el historial en memoria a nuevas conexiones. |
| 12 | El código se organiza respetando la separación de responsabilidades. |
| 13 | Implementa bloques `try/catch` en todas las llamadas asíncronas a las APIs externas. Si JSONPlaceholder u Open-Meteo fallan, la app no colapsa y muestra mensajes amigables en la vista. |
| 14 | El chat global funciona correctamente. |
| 15 | Renderizado completo mediante plantillas EJS y archivos estáticos CSS/JS en `/public`. |
| 16 | Presenta una maquetación clara y organizada en 3 paneles (Panel Clima, Feed Social, Chat/Live). |
| 17 | Creó **documentación manual de usuario**. |
| 18 | Cumplimiento de requisitos y funcionalidad. |
| 19 | Buenas prácticas de programación. |
| 20 | Un diseño visualmente agradable y bien estructurado. |

**Total:** 20 aspectos × 5 pts = 100 pts.

> Ojo: los puntos 14 (chat global), 17 (manual de usuario) y 3 (defensa oral) aparecen en la rúbrica aunque no tienen un requisito numerado propio en la descripción. Hay que incluirlos igual.

---

## 5. Criterios de evaluación

- Cumplimiento de todas las funcionalidades especificadas.
- Calidad del código y buenas prácticas de desarrollo.
- Si se detecta código de IA usado **sin un adecuado proceso de comprensión, adaptación y atribución**, puede haber penalización: pérdida de puntos, repetir o rehacer la tarea con instrucciones claras, o incluso sanciones disciplinarias según las políticas académicas de la institución.

---

## 6. Checklist de entregables

- [ ] Carpeta nombrada `Proyecto1-Nombre`
- [ ] Código 100% TypeScript (servidor y scripts de cliente en `/public`, compilados desde `.ts`)
- [ ] Express + EJS con vistas y parciales en `/views`
- [ ] `/services` con llamadas a JSONPlaceholder, Open-Meteo y geolocalización por IP
- [ ] `/routes` con los endpoints de Express
- [ ] `/public` con CSS y JS de cliente
- [ ] Interfaces `Post` y `User` tipadas
- [ ] Servidor WebSocket: broadcast de posts nuevos, historial en memoria enviado a nuevas conexiones
- [ ] Chat global funcional
- [ ] Manejo de errores con `try/catch` y mensajes amigables en la vista
- [ ] Layout de 3 paneles: Clima | Feed Social | Chat
- [ ] Manual de usuario (documentación)
- [ ] Entrega dentro del plazo

---

## 7. Notas de implementación (aportes adicionales, no son parte del enunciado original)

- **Localhost y geolocalización:** en desarrollo local la IP del cliente es `127.0.0.1` o `::1`, y tanto `geoip-lite` como `ip-api.com` no devuelven una ciudad útil. Conviene definir una **ubicación por defecto** (fallback) con coordenadas fijas para que el clima siga funcionando en pruebas, y reflejarlo con un mensaje amigable.
- **Librería de WebSockets:** el enunciado dice "WebSockets" sin especificar librería (por ejemplo `ws` o `socket.io`). Definir una y justificarla para la defensa oral.
- **Cliente en TypeScript:** como los scripts de `/public` también deben ser TypeScript, hay que configurar la compilación (por ejemplo, un `tsconfig` que emita los `.js` a `/public`).
- **Open-Meteo:** el clima actual se obtiene por latitud/longitud, con temperatura y velocidad del viento como mínimo.