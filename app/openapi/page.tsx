import React from "react";

export default function OpenAPIPage() {
  return (
    <html>
      <head>
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <div style={{ padding: 20 }}>
          <h1>API Documentation</h1>
          <p>
            Open the interactive Swagger UI: <a href="/swagger">/swagger</a>
          </p>
        </div>
      </body>
    </html>
  );
}
