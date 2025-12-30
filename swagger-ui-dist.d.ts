declare module 'swagger-ui-dist' {
  interface SwaggerUIDist {
    getAbsoluteFSPath(): string;
  }
  
  const swaggerUiDist: SwaggerUIDist;
  export default swaggerUiDist;
  export function getAbsoluteFSPath(): string;
}

