# Implementación SEO — benjicode.com

Fecha: 2026-07-09

Objetivo: que Google identifique correctamente la información profesional de
Benjamín Atoche López (BenjiCode) y tenga mayores posibilidades de mostrar
enlaces de sitio (sitelinks) como Contacto, Curriculum, Proyectos y Sobre mí
debajo del resultado principal.

> Nota: los sitelinks los decide Google automáticamente; no se pueden forzar.
> Lo implementado aquí (URLs claras, navegación consistente, anclas con nombre,
> datos estructurados y textos de enlace descriptivos) es lo que maximiza la
> probabilidad de que aparezcan.

---

## Archivos creados

| Archivo | Propósito |
|---|---|
| `contacto/index.html` | Página pública de contacto en `/contacto/` con todos los datos rastreables como HTML |
| `site.webmanifest` | Web app manifest con nombre, descripción, colores e iconos |
| `images/benjicode-180.png` | Icono 180×180 para `apple-touch-icon` |
| `images/benjicode-192.png` | Icono 192×192 para el manifest |
| `images/benjicode-logo.png` | Logo 160×160 optimizado para el navbar (14KB vs 210KB del original) |
| `SEO_IMPLEMENTACION.md` | Este documento |

## Archivos modificados

| Archivo | Cambios |
|---|---|
| `index.html` | Title con nombre completo, description, keywords, hreflang `x-default`, OG/Twitter actualizados, JSON-LD ampliado (ver abajo), menú con Sobre mí/Proyectos/Contacto, ancla `#sobre-mi`, enlaces `mailto:`/`tel:` en la sección de contacto, footer con navegación y enlaces de contacto, manifest y apple-touch-icon |
| `curriculum/index.html` | Añadidos: robots, author, theme-color, hreflang, Open Graph, Twitter Cards, BreadcrumbList JSON-LD, manifest, apple-touch-icon (title, description y canonical ya existían y se conservaron) |
| `css/style.css` | Estilos para la navegación del footer y los enlaces de contacto (además de optimizaciones de rendimiento previas) |
| `sitemap.xml` | Añadidas `/contacto/` y `/curriculum/` con `lastmod` |

## Página de contacto `/contacto/`

Todos los datos están en HTML plano (sin depender de JavaScript, imágenes ni
botones sin texto):

- Correo como texto y enlace `mailto:atochelopezb@gmail.com`
- Teléfono como texto y enlace `tel:+51992803880`
- WhatsApp con su URL (`https://api.whatsapp.com/send?phone=51992803880`)
- Portafolio como enlace normal a `https://benjicode.com/`
- LinkedIn: `https://www.linkedin.com/in/benjamin-atoche-lopez/`
- GitHub: `https://github.com/Benji379`
- Instagram y TikTok
- Textos de enlace descriptivos: "Contactar por correo", "Contactar por
  WhatsApp", "Llamar por teléfono", "Ver portafolio de proyectos",
  "Ver curriculum en PDF"

## Metadatos por página

| Página | Title único | Description única | Canonical | OG | Twitter | Robots |
|---|---|---|---|---|---|---|
| `/` | ✅ | ✅ | `https://benjicode.com` | ✅ | ✅ | index, follow |
| `/contacto/` | ✅ | ✅ | `https://benjicode.com/contacto/` | ✅ | ✅ | index, follow |
| `/curriculum/` | ✅ | ✅ | `https://benjicode.com/curriculum/` | ✅ | ✅ | index, follow |
| `/config/` | — | — | — | — | — | **noindex, nofollow (intencional: página privada de ajustes)** |

## Datos estructurados implementados (JSON-LD, Schema.org)

- **`Person`** (en `/`): name, givenName/additionalName/familyName,
  `alternateName` con todas las variantes del nombre (Benjamin Atoche,
  Benjamín Atoche López, Benjamin Justo Atoche Lopez, BenjiCode, Benji Code,
  BCode, Benji Jal, Benji), url, image, jobTitle, email (`mailto:`),
  telephone, description, knowsAbout (React, Node.js, Java, Spring Boot,
  Python, TypeScript, Docker, PostgreSQL, MongoDB, CI/CD…), address
  (Lima, PE), alumniOf (UTP) y sameAs (GitHub, LinkedIn, Instagram, TikTok).
- **`WebSite`** (en `/`): name, alternateName, url, inLanguage, **publisher**
  (Person) y potentialAction de contacto.
- **`ProfilePage`** (en `/`): la página principal como perfil de la Person.
- **`ContactPage`** (en `/contacto/`): con mainEntity Person incluyendo
  **contactPoint** (email, teléfono, idiomas, areaServed Worldwide).
- **`BreadcrumbList`** (en `/contacto/` y `/curriculum/`).

Todos los bloques fueron validados como JSON parseable en navegador real.
Para la validación oficial: https://search.google.com/test/rich-results
(pegar la URL de cada página una vez desplegada).

## Comprobaciones realizadas

- ✅ Sin `noindex` en páginas importantes (solo `/config/`, intencional)
- ✅ `robots.txt` permite todo y referencia el sitemap
- ✅ Sin enlaces internos rotos (verificado con crawler headless: todos 200)
- ✅ Títulos únicos por página, sin duplicados
- ✅ Canonicals apuntando a su propia URL correcta
- ✅ Contenido visible sin JavaScript (sitio estático, no SPA — no requiere
  prerenderizado; los datos de contacto están en el HTML crudo)
- ✅ manifest, favicon, apple-touch-icon e iconos accesibles (200)
- ✅ Corregido enlace de LinkedIn en `sameAs` (apuntaba a un perfil inexistente
  `benjamin-atoche`; ahora `benjamin-atoche-lopez`)

## URLs para registrar en Google Search Console

1. Verificar la propiedad **Dominio: `benjicode.com`** (o prefijo
   `https://benjicode.com/`).
2. Enviar el sitemap: `https://benjicode.com/sitemap.xml`
3. Pedir indexación manual (Inspección de URLs) de:
   - `https://benjicode.com/`
   - `https://benjicode.com/contacto/`
   - `https://benjicode.com/curriculum/`

## Valores que quedan por reemplazar manualmente

Ninguno. Todos los datos (correo, teléfono, LinkedIn, GitHub, redes) ya
estaban publicados en el sitio y se reutilizaron; no se inventó ningún dato.

Pendientes opcionales que solo tú puedes hacer:

- [ ] Solicitar re-indexación en Google Search Console tras el deploy
- [ ] Confirmar que `https://www.linkedin.com/in/benjamin-atoche-lopez/` es tu
      perfil correcto de LinkedIn (es el que estaba enlazado en la página)
- [ ] Si algún día usas una foto de retrato real distinta al logo, actualizar
      `image` en el JSON-LD `Person`
