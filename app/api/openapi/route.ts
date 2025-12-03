import { NextResponse } from "next/server";

// Minimal OpenAPI 3.0 spec for local testing
const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "پردیس گستر چینود API",
    version: "0.1.0",
    description:
      "مستندات API برای پروژه پردیس گستر چینود. این API امکان مدیریت کاتالوگ کاردها و احراز هویت را فراهم می‌کند.",
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
        description: "شیء کارد کاتالوگ",
        properties: {
          id: {
            type: "string",
            description: "شناسه یکتا کارد",
            example: "507f1f77bcf86cd799439011",
          },
          title: {
            type: "string",
            description: "عنوان کارد",
            example: "محصول نمونه",
          },
          description: {
            type: "string",
            nullable: true,
            description: "توضیحات کارد (اختیاری)",
            example: "این یک نمونه کارد است",
          },
          image: {
            type: "string",
            nullable: true,
            description: "تصویر کارد به صورت base64 (اختیاری)",
          },
          imageMimeType: {
            type: "string",
            nullable: true,
            description: "نوع MIME تصویر (مثل image/jpeg, image/png)",
            example: "image/jpeg",
          },
          itemViewType: {
            type: "string",
            enum: ["type1", "type2", "type3"],
            description:
              "نوع نمایش کارد در صفحه اصلی: type1 (عکس بالا و متن پایین), type2 (متن راست و عکس چپ), type3 (عکس راست و متن چپ)",
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
        description: "داده‌های مورد نیاز برای ایجاد یا به‌روزرسانی کارد",
        properties: {
          title: {
            type: "string",
            description: "عنوان کارد (الزامی)",
            example: "محصول جدید",
          },
          description: {
            type: "string",
            nullable: true,
            description: "توضیحات کارد (اختیاری)",
            example: "توضیحات محصول جدید",
          },
          image: {
            type: "string",
            format: "binary",
            description:
              "فایل تصویر (JPEG, PNG, یا WebP، حداکثر 5 مگابایت) - اختیاری",
          },
          itemViewType: {
            type: "string",
            enum: ["type1", "type2", "type3"],
            description:
              "نوع نمایش کارد: type1 (عکس بالا), type2 (عکس چپ), type3 (عکس راست). پیش‌فرض: type1",
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
        summary: "لیست کاردهای کاتالوگ",
        description:
          "دریافت تمام کاردهای کاتالوگ. این endpoint همه کاردها را برمی‌گرداند. Pagination و فیلتر در سمت کلاینت انجام می‌شود.",
        tags: ["Catalog"],
        responses: {
          "200": {
            description: "لیست موفقیت‌آمیز کاردهای کاتالوگ",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CatalogDTO" },
                },
                example: [
                  {
                    id: "507f1f77bcf86cd799439011",
                    title: "مثال کارد",
                    description: "توضیحات نمونه",
                    itemViewType: "type1",
                  },
                ],
              },
            },
          },
          "500": {
            description: "خطای سرور",
          },
        },
      },
      post: {
        summary: "ایجاد کارد جدید (فقط ادمین)",
        description: "ایجاد یک کارد جدید در کاتالوگ. نیاز به احراز هویت دارد.",
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
            description: "کارد با موفقیت ایجاد شد",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Created" },
              },
            },
          },
          "400": {
            description:
              "درخواست نامعتبر (مثلاً عنوان خالی است یا فرمت تصویر نامعتبر)",
            content: {
              "text/plain": {
                schema: { type: "string", example: "عنوان الزامی است" },
              },
            },
          },
          "403": {
            description: "دسترسی غیرمجاز - نیاز به احراز هویت ادمین",
          },
          "500": {
            description: "خطای سرور",
          },
        },
      },
    },
    "/api/catalog/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        summary: "دریافت یک کارد خاص",
        description: "دریافت جزئیات یک کارد با استفاده از شناسه آن",
        tags: ["Catalog"],
        responses: {
          "200": {
            description: "کارد پیدا شد",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CatalogDTO" },
                example: {
                  id: "507f1f77bcf86cd799439011",
                  title: "مثال کارد",
                  description: "توضیحات نمونه",
                  itemViewType: "type1",
                },
              },
            },
          },
          "404": {
            description: "کارد پیدا نشد",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Not found" },
              },
            },
          },
          "500": {
            description: "خطای سرور",
          },
        },
      },
      put: {
        summary: "به‌روزرسانی کارد (فقط ادمین)",
        description:
          "به‌روزرسانی اطلاعات یک کارد موجود. تمام فیلدها اختیاری هستند - فقط فیلدهای ارسال شده به‌روزرسانی می‌شوند.",
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
            description: "کارد با موفقیت به‌روزرسانی شد",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Updated" },
              },
            },
          },
          "400": {
            description: "درخواست نامعتبر",
            content: {
              "text/plain": {
                schema: { type: "string", example: "خطا در به‌روزرسانی" },
              },
            },
          },
          "403": {
            description: "دسترسی غیرمجاز - نیاز به احراز هویت ادمین",
          },
          "404": {
            description: "کارد پیدا نشد",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Not found" },
              },
            },
          },
          "500": {
            description: "خطای سرور",
          },
        },
      },
      delete: {
        summary: "حذف کارد (فقط ادمین)",
        description: "حذف یک کارد از کاتالوگ. این عملیات قابل بازگشت نیست.",
        tags: ["Catalog"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "کارد با موفقیت حذف شد",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Deleted" },
              },
            },
          },
          "403": {
            description: "دسترسی غیرمجاز - نیاز به احراز هویت ادمین",
          },
          "404": {
            description: "کارد پیدا نشد",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Not found" },
              },
            },
          },
          "500": {
            description: "خطای سرور",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "ورود به سیستم",
        description:
          "ورود به سیستم و دریافت access token و refresh token. Access token به مدت 15 دقیقه و refresh token به مدت 7 روز معتبر است.",
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
            description: "ورود موفق - توکن‌ها دریافت شدند",
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
            description: "نام کاربری یا رمز عبور نامعتبر",
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
        summary: "تجدید access token",
        description:
          "استفاده از refresh token برای دریافت access token جدید. یک refresh token جدید نیز برگردانده می‌شود.",
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
            description: "توکن‌های جدید با موفقیت دریافت شدند",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenResponse" },
              },
            },
          },
          "401": {
            description: "Refresh token نامعتبر یا منقضی شده است",
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
        summary: "خروج از سیستم",
        description:
          "خروج از سیستم و لغو refresh token. پس از این عملیات، refresh token دیگر معتبر نخواهد بود.",
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
            description: "خروج با موفقیت انجام شد",
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
        summary: "بررسی وضعیت احراز هویت",
        description:
          "بررسی اینکه کاربر احراز هویت شده است یا خیر و دریافت اطلاعات کاربر جاری.",
        tags: ["Authentication"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "کاربر احراز هویت شده است",
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
            description: "کاربر احراز هویت نشده است",
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
          description: "شناسه یکتا کارد",
          example: "507f1f77bcf86cd799439011",
        },
      ],
      get: {
        summary: "دریافت تصویر کارد",
        description:
          "دریافت تصویر یک کارد خاص. تصویر با Content-Type مناسب برگردانده می‌شود و کش می‌شود.",
        tags: ["Catalog"],
        responses: {
          "200": {
            description: "تصویر کارد",
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
                description: "نوع MIME تصویر",
                example: "image/jpeg",
              },
              "Cache-Control": {
                schema: { type: "string" },
                description: "کنترل کش",
                example: "public, max-age=31536000, immutable",
              },
            },
          },
          "404": {
            description: "تصویر یا کارد پیدا نشد",
            content: {
              "text/plain": {
                schema: { type: "string", example: "Image not found" },
              },
            },
          },
          "500": {
            description: "خطای سرور",
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openapiSpec);
}
