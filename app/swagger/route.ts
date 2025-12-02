import { NextResponse } from "next/server";

// Serve HTML referencing swagger-ui-dist assets from CDN
export async function GET(req: Request) {
  const html = `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>پردیس گستر چینود - API Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.19.1/swagger-ui.css" />
    <style>
      body {
        margin: 0;
      }
      #swagger-ui {
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.19.1/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.19.1/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: '/api/openapi',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          requestInterceptor: (req) => {
            try {
              // Get token from cookie
              const getCookie = (name) => {
                const value = '; ' + document.cookie;
                const parts = value.split('; ' + name + '=');
                if (parts.length === 2) return parts.pop().split(';').shift();
                return null;
              };
              const token = typeof window !== 'undefined' ? getCookie('accessTokenClient') : null;
              if (token) {
                req.headers['authorization'] = 'Bearer ' + token;
                req.headers['Authorization'] = 'Bearer ' + token;
              }
            } catch (e) {}
            return req;
          }
        });
        window.ui = ui;
      };
    </script>
  </body>
  </html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
