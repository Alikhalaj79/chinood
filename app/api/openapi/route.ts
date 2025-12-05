import { NextResponse } from "next/server";

// Minimal OpenAPI 3.0 spec for local testing
const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Chinood API",
    version: "0.1.0",
    description:
      "API documentation for Chinood project. This API provides catalog card management and authentication capabilities.",
    contact: {
      name: "API Support",
    },
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
        description: "Catalog card object",
        properties: {
          id: {
            type: "string",
            description: "Unique card identifier",
            example: "507f1f77bcf86cd799439011",
          },
          title: {
            type: "string",
            description: "Card title",
            example: "Sample Product",
          },
          description: {
            type: "string",
            nullable: true,
            description: "Card description (optional)",
            example: "This is a sample card",
          },
          image: {
            type: "string",
            nullable: true,
            description: "Card image as base64 (optional)",
          },
          imageMimeType: {
            type: "string",
            nullable: true,
            description: "Image MIME type (e.g., image/jpeg, image/png)",
            example: "image/jpeg",
          },
          itemViewType: {
            type: "string",
            enum: ["type1", "type2", "type3"],
            description:
              "Card display type on main page: type1 (image top, text bottom), type2 (text left, image right), type3 (image left, text right)",
            default: "type1",
            example: "type1",
          },
        },
        required: ["id", "title"],
      },
      TokenResponse: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            description: "JWT access token (expires in 15 minutes)",
          },
          refreshToken: {
            type: "string",
            description: "JWT refresh token (expires in 7 days)",
          },
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
        description: "Data required for creating or updating a card",
        properties: {
          title: {
            type: "string",
            description: "Card title (required)",
            example: "New Product",
          },
          description: {
            type: "string",
            nullable: true,
            description: "Card description (optional)",
            example: "Description of the new product",
          },
          image: {
            type: "string",
            format: "binary",
            description:
              "Image file (JPEG, PNG, or WebP, maximum 5MB) - optional",
          },
          itemViewType: {
            type: "string",
            enum: ["type1", "type2", "type3"],
            description:
              "Card display type: type1 (image top), type2 (image left), type3 (image right). Default: type1",
            default: "type1",
            example: "type1",
          },
        },
        required: ["title"],
      },
    },
  },
  paths: {
    "/api/catalog": {
      get: {
        summary: "List catalog cards",
        description:
          "Retrieve all catalog cards. This endpoint returns all cards. Pagination and filtering are handled on the client side.",
        tags: ["Catalog"],
        responses: {
          "200": {
            description: "Successfully retrieved catalog cards list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CatalogDTO" },
                },
                example: [
                  {
                    id: "507f1f77bcf86cd799439011",
                    title: "Example Card",
                    description: "Sample description",
                    itemViewType: "type1",
                  },
                ],
              },
            },
          },
          "500": {
            description: "Server error",
          },
        },
      },
      post: {
        summary: "Create new card (Admin only)",
        description: "Create a new card in the catalog. Requires authentication.",
        tags: ["Catalog"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/CreateCatalogItem" },
            },
          },
        },
        responses: {
          "201": {
            description: "Card successfully created",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Created" },
              },
            },
          },
          "400": {
            description:
              "Invalid request (e.g., empty title or invalid image format)",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Title is required" },
              },
            },
          },
          "403": {
            description: "Forbidden - Admin authentication required",
          },
          "500": {
            description: "Server error",
          },
        },
      },
    },
    "/api/catalog/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "Get a specific card",
        description: "Retrieve details of a card using its identifier",
        tags: ["Catalog"],
        responses: {
          "200": {
            description: "Card found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CatalogDTO" },
                example: {
                  id: "507f1f77bcf86cd799439011",
                  title: "Example Card",
                  description: "Sample description",
                  itemViewType: "type1",
                },
              },
            },
          },
          "404": {
            description: "Card not found",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Not found" },
              },
            },
          },
          "500": {
            description: "Server error",
          },
        },
      },
      put: {
        summary: "Update card (Admin only)",
        description:
          "Update information of an existing card. All fields are optional - only sent fields will be updated.",
        tags: ["Catalog"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/CreateCatalogItem" },
            },
          },
        },
        responses: {
          "200": {
            description: "Card successfully updated",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Updated" },
              },
            },
          },
          "400": {
            description: "Invalid request",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Update error" },
              },
            },
          },
          "403": {
            description: "Forbidden - Admin authentication required",
          },
          "404": {
            description: "Card not found",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Not found" },
              },
            },
          },
          "500": {
            description: "Server error",
          },
        },
      },
      delete: {
        summary: "Delete card (Admin only)",
        description: "Delete a card from the catalog. This operation cannot be undone.",
        tags: ["Catalog"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Card successfully deleted",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Deleted" },
              },
            },
          },
          "403": {
            description: "Forbidden - Admin authentication required",
          },
          "404": {
            description: "Card not found",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Not found" },
              },
            },
          },
          "500": {
            description: "Server error",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login",
        description:
          "Login and receive access token and refresh token. Access token is valid for 15 minutes and refresh token is valid for 7 days.",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: {
                username: "admin",
                password: "password",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful - tokens received",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenResponse" },
                example: {
                  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
          "401": {
            description: "Invalid username or password",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "Unauthorized" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        summary: "Refresh access token",
        description:
          "Use refresh token to get a new access token. A new refresh token is also returned.",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
              example: {
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "New tokens successfully received",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenResponse" },
              },
            },
          },
          "401": {
            description: "Invalid or expired refresh token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Invalid or expired refresh token",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Logout",
        description:
          "Logout and revoke refresh token. After this operation, the refresh token will no longer be valid.",
        tags: ["Authentication"],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LogoutRequest" },
              example: {
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Logged out successfully",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Check authentication status",
        description:
          "Check if user is authenticated and get current user information.",
        tags: ["Authentication"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User is authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthStatusResponse" },
                example: {
                  authenticated: true,
                  user: {
                    username: "admin",
                    admin: true,
                  },
                },
              },
            },
          },
          "401": {
            description: "User is not authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthStatusResponse" },
                example: {
                  authenticated: false,
                  user: null,
                },
              },
            },
          },
        },
      },
    },
    "/api/images/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Unique card identifier",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      get: {
        summary: "Get card image",
        description:
          "Retrieve image of a specific card. Image is returned with appropriate Content-Type and cached.",
        tags: ["Catalog"],
        responses: {
          "200": {
            description: "Card image",
            content: {
              "image/jpeg": {
                schema: { type: "string", format: "binary" },
              },
              "image/png": {
                schema: { type: "string", format: "binary" },
              },
              "image/webp": {
                schema: { type: "string", format: "binary" },
              },
            },
            headers: {
              "Content-Type": {
                schema: { type: "string" },
                description: "Image MIME type",
                example: "image/jpeg",
              },
              "Cache-Control": {
                schema: { type: "string" },
                description: "Cache control",
                example: "public, max-age=31536000, immutable",
              },
            },
          },
          "404": {
            description: "Image or card not found",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Image not found" },
              },
            },
          },
          "500": {
            description: "Server error",
          },
        },
      },
    },
    "/api/settings": {
      get: {
        summary: "Get settings",
        description: "Retrieve application settings. This endpoint is public and does not require authentication.",
        tags: ["Settings"],
        responses: {
          "200": {
            description: "Settings retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    catalogViewType: {
                      type: "string",
                      enum: ["grid", "list", "card"],
                      description: "Catalog view type",
                      example: "list",
                    },
                    cardDirection: {
                      type: "string",
                      enum: ["top-to-bottom", "bottom-to-top"],
                      description: "Card display direction",
                      example: "top-to-bottom",
                    },
                    itemsPerPage: {
                      type: "number",
                      description: "Number of items per page for pagination",
                      minimum: 1,
                      maximum: 50,
                      example: 7,
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Server error",
          },
        },
      },
      put: {
        summary: "Update settings (Admin only)",
        description: "Update application settings. Requires admin authentication.",
        tags: ["Settings"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  catalogViewType: {
                    type: "string",
                    enum: ["grid", "list", "card"],
                    description: "Catalog view type",
                  },
                  cardDirection: {
                    type: "string",
                    enum: ["top-to-bottom", "bottom-to-top"],
                    description: "Card display direction",
                  },
                  itemsPerPage: {
                    type: "number",
                    description: "Number of items per page for pagination",
                    minimum: 1,
                    maximum: 50,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Settings updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    catalogViewType: {
                      type: "string",
                      enum: ["grid", "list", "card"],
                    },
                    cardDirection: {
                      type: "string",
                      enum: ["top-to-bottom", "bottom-to-top"],
                    },
                    itemsPerPage: {
                      type: "number",
                    },
                  },
                },
              },
            },
          },
          "403": {
            description: "Forbidden - Admin authentication required",
          },
          "500": {
            description: "Server error",
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openapiSpec);
}
