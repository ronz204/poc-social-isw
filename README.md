# Proyecto 1: Red Social con Integración Meteorológica y Chat Global

Plataforma web que simula una red social con tres paneles: el **clima** de tu ubicación, un **feed social** y un **chat global** en tiempo real. Proyecto 1 del curso ISW621, Universidad Técnica Nacional.

Este documento es el **manual de usuario**: cómo instalar y ejecutar la aplicación, cómo usar cada panel y qué hacer si algo falla.

---

## 1. Qué es y qué muestra

La página principal tiene tres paneles:

| Panel | Contenido |
|---|---|
| **Clima** (izquierda) | Temperatura (°C) y velocidad del viento (km/h) actuales de tu ubicación aproximada. |
| **Feed social** (centro) | Publicaciones tuyas y de otros visitantes en tiempo real, y debajo las publicaciones de la API pública JSONPlaceholder con el nombre de su autor. |
| **Chat** (derecha) | Una sala de chat global compartida por todos los visitantes conectados. |

Todo lo que los visitantes crean (publicaciones y mensajes) vive **solo en la memoria del servidor**: no hay base de datos ni cuentas. Si el servidor se reinicia, ese contenido desaparece.

---

## 2. Requisitos e instalación

Necesitas [Bun](https://bun.sh) instalado y conexión a internet (para JSONPlaceholder y Open-Meteo).

```bash
bun install
```

---

## 3. Ejecutar la aplicación

```bash
bun run start
```

Este comando compila los scripts de cliente (TypeScript) y el CSS, y levanta el servidor. Luego abre <http://localhost:3000> en el navegador.

Otros comandos útiles:

| Comando | Qué hace |
|---|---|
| `bun run dev` | Modo desarrollo: recarga el servidor y recompila cliente y CSS al guardar cambios. |
| `bun run build` | Solo compila los scripts de cliente y el CSS hacia `public/`. |
| `bun run start:express` | Arranca la versión del servidor hecha con Express + EJS. |
| `bun run start:elysia` | Arranca la versión con Elysia (es la que usa `start` por defecto). |

### Cambiar el puerto

Por defecto el servidor usa el puerto `3000`. Para usar otro, crea un archivo `.env` en la raíz del proyecto:

```
PORT=4000
```

---

## 4. Cómo usar cada panel

### 4.1 Clima

El clima aparece solo, sin que tengas que hacer nada. La aplicación deduce tu ubicación aproximada a partir de tu dirección IP y consulta las coordenadas en Open-Meteo.

- Si tu IP no permite ubicarte (por ejemplo, al ejecutar la aplicación en tu propia computadora, donde la IP es `127.0.0.1`), se usa una **ubicación por defecto: San José, Costa Rica**, y el panel lo indica.
- La ubicación por IP es aproximada y puede no mostrar el nombre de la ciudad.
- El clima se guarda unos minutos en memoria, así que recargar la página muchas veces seguidas no vuelve a consultar la API cada vez.

### 4.2 Feed social

Muestra las publicaciones de JSONPlaceholder, cada una con **título, contenido y nombre del autor**. Se cargan por páginas de 10 publicaciones: al bajar por el feed se piden las siguientes hasta llegar al final.

### 4.3 Publicar algo nuevo

1. Escribe tu **nombre** (hasta 30 caracteres).
2. Escribe el **texto** de tu publicación (hasta 280 caracteres).
3. Envía el formulario.

La publicación aparece al instante, **para todos los visitantes conectados**, arriba de las publicaciones de la API y con la más nueva primero. El servidor le asigna un identificador único y la hora (formato `hh:mm AM/PM`). Si abres la página más tarde, verás las últimas 100 publicaciones.

Si el nombre o el texto están vacíos o superan el máximo, la publicación se rechaza y no se envía a nadie.

### 4.4 Chat global

1. Escribe tu nombre (hasta 30 caracteres) y tu mensaje (hasta 200 caracteres).
2. Envía el mensaje.

Todos los visitantes conectados lo ven de inmediato. Al entrar a la página recibes los últimos 50 mensajes. El chat es único y global: no hay salas ni mensajes privados.

Para probarlo, abre la aplicación en dos pestañas o dos navegadores a la vez y escribe en una: el mensaje aparece en la otra.

### 4.5 Estado de la conexión

La página usa una única conexión WebSocket para las publicaciones y el chat. Si se corta (por ejemplo, el servidor se reinicia), el navegador **reintenta solo**, esperando 1 segundo la primera vez y más después, hasta un máximo de 10 segundos entre intentos. Al reconectar se vuelven a cargar los historiales.

---

## 5. Qué pasa cuando algo falla

La aplicación nunca debe congelarse ni mostrar errores técnicos:

| Situación | Lo que ves |
|---|---|
| JSONPlaceholder no responde | El panel del feed muestra un mensaje amigable; el clima y el chat siguen funcionando. |
| Open-Meteo no responde | El panel del clima muestra un mensaje amigable; el feed y el chat siguen funcionando. |
| Fallan ambas APIs | Se ven los tres paneles, cada uno con su mensaje. |
| Un error inesperado | Una página de error amigable, sin detalles técnicos. |
| Se pierde la conexión en vivo | Reconexión automática (sección 4.5). |

---

## 6. Solución de problemas

- **No abre en el navegador:** confirma que el servidor está corriendo y que usas el puerto correcto (`3000` por defecto).
- **La página se ve sin estilos o los paneles no responden:** ejecuta `bun run build` y reinicia, o usa `bun run start`, que compila antes de arrancar.
- **El clima muestra San José:** es lo esperado en una ejecución local; la ubicación por defecto se usa cuando la IP no se puede ubicar.
- **Mi publicación o mensaje no se envió:** revisa que el nombre y el texto no estén vacíos ni excedan los límites (nombre 30, publicación 280, mensaje 200).
- **Desaparecieron las publicaciones y mensajes:** es normal tras reiniciar el servidor, porque todo se guarda solo en memoria.

---

## 7. Información técnica (resumen)

- **Lenguaje:** 100 % TypeScript, tanto el servidor como los scripts de cliente.
- **Ejecución:** Bun. Hay dos servidores equivalentes: Elysia (por defecto) y Express con plantillas EJS.
- **APIs externas:** JSONPlaceholder (`/posts` y `/users`), Open-Meteo (clima por coordenadas) y la librería local `geoip-lite` para ubicar la IP.
- **Tiempo real:** WebSocket en `/ws`, con la librería `ws` en la versión Express.
- **Almacenamiento:** solo memoria RAM, sin base de datos.
- **Estructura:** el código está en `source/` dividido en `app` (casos de uso), `core` (reglas del dominio) e `infra` (vistas, adaptadores de APIs y scripts de cliente). Los archivos estáticos compilados salen en `public/`.
