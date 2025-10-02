import swaggerJsdoc from "swagger-jsdoc";
import config from "./index";
import { swaggerComponents } from "./swagger-components";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: config.swagger.title,
      version: config.swagger.version,
      description: config.swagger.description,
    },
    servers: [
      {
        url: `http://${config.swagger.host}${config.swagger.basePath}`,
        description: "Servidor de desenvolvimento",
      },
    ],
    components: {
      ...swaggerComponents,
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
