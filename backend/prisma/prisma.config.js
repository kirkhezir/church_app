"use strict";
/**
 * Prisma 7 Configuration
 * https://pris.ly/d/prisma7-client-config
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
exports.default = (0, client_1.defineConfig)({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
//# sourceMappingURL=prisma.config.js.map