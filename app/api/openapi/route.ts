import { NextResponse } from "next/server";

// Minimal OpenAPI 3.0 spec for local testing
const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "پردیس گستر چینود API",
    version: "0.1.0",
    description: "API documentation for پردیس گستر چینود project.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      CatalogDTO: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          price: { type: "number" },
          image: { type: "string", nullable: true },
        },
        required: ["id", "title", "price"],
      },
      TokenResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string", description: "JWT access token (expires in 15 minutes)" },
          refreshToken: { type: "string", description: "JWT refresh token (expires in 7 days)" },
        },
        required: ["accessToken", "refreshToken"],
      },
      RefreshTokenRequest: {
        type: "object",
        properties: {
          refreshToken: { type: "string" },
        },
        required: ["refreshToken"],
      },
      LogoutRequest: {
        type: "object",
        properties: {
          refreshToken: { type: "string" },
        },
      },
      AuthStatusResponse: {
        type: "object",
        properties: {
          authenticated: { type: "boolean" },
          user: {
            type: "object",
            nullable: true,
            properties: {
              username: { type: "string" },
              admin: { type: "boolean" },
            },
          },
          error: { type: "string", nullable: true },
        },
        required: ["authenticated"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          username: { type: "string" },
          password: { type: "string" },
        },
        required: ["username", "password"],
      },
      CreateCatalogItem: {
        type: "object",
        properties: {
          title: { type: "string" },
          price: { type: "number" },
          image: { type: "string" },
          description: { type: "string", nullable: true },
        },
        required: ["title", "price"],
      },
    },
  },
  paths: {
    "/api/catalog": {
      get: {
        summary: "List catalog items",
        responses: {
          "200": {
            description: "A list of catalog items",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CatalogDTO" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create catalog item (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCatalogItem" },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Bad request" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/catalog/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get single catalog item",
        responses: {
          "200": {
            description: "Item found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CatalogDTO" },
              },
            },
          },
          "404": { description: "Not found" },
        },
      },
      put: {
        summary: "Update catalog item (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCatalogItem" },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "400": { description: "Bad request" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        summary: "Delete catalog item (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Deleted" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login and get access token and refresh token (admin static credentials)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Access token and refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenResponse" },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Refresh access token using refresh token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "New access token and refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenResponse" },
              },
            },
          },
          "401": { description: "Invalid or expired refresh token" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Logout and revoke refresh token",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LogoutRequest" },
            },
          },
        },
        responses: {
          "200": { description: "Logged out successfully" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Check authentication status and get current user info",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User is authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthStatusResponse" },
              },
            },
          },
          "401": {
            description: "User is not authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthStatusResponse" },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openapiSpec);
}
