import { Response } from 'supertest';
import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as path from 'path';

/**
 * OpenAPI Schema Validator
 * Validates HTTP responses against OpenAPI specification
 */
export class OpenAPIValidator {
  private static instance: OpenAPIValidator;
  private api: any;
  private ajv: Ajv;
  private isInitialized = false;

  private constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateFormats: true,
    });
    addFormats(this.ajv);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OpenAPIValidator {
    if (!OpenAPIValidator.instance) {
      OpenAPIValidator.instance = new OpenAPIValidator();
    }
    return OpenAPIValidator.instance;
  }

  /**
   * Initialize validator by loading OpenAPI spec
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const specPath = path.join(
        __dirname,
        '../../../specs/001-full-stack-web/contracts/openapi.yaml'
      );
      this.api = await SwaggerParser.validate(specPath);
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error}`);
    }
  }

  /**
   * Validate response against OpenAPI spec
   * @param method HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param path API path (e.g., '/api/v1/members')
   * @param statusCode HTTP status code
   * @param response Response body
   */
  public validateResponse(
    method: string,
    path: string,
    statusCode: number,
    response: any
  ): ValidationResult {
    if (!this.isInitialized) {
      throw new Error('OpenAPIValidator not initialized. Call initialize() first.');
    }

    const errors: ValidationError[] = [];

    // Find matching path in OpenAPI spec
    const pathItem = this.findPathItem(path);
    if (!pathItem) {
      errors.push({
        message: `Path ${path} not found in OpenAPI spec`,
        path: path,
        type: 'path',
      });
      return { valid: false, errors };
    }

    // Get operation (method) from path
    const operation = pathItem[method.toLowerCase()];
    if (!operation) {
      errors.push({
        message: `Method ${method} not found for path ${path}`,
        path: path,
        type: 'method',
      });
      return { valid: false, errors };
    }

    // Get response schema for status code
    const responseSpec = operation.responses[statusCode.toString()];
    if (!responseSpec) {
      errors.push({
        message: `Status code ${statusCode} not documented for ${method} ${path}`,
        path: path,
        type: 'status',
      });
      return { valid: false, errors };
    }

    // Validate response body against schema
    const content = responseSpec.content?.['application/json'];
    if (content?.schema) {
      const schema = this.resolveSchema(content.schema);
      const valid = this.ajv.validate(schema, response);

      if (!valid && this.ajv.errors) {
        this.ajv.errors.forEach((error) => {
          errors.push({
            message: error.message || 'Validation error',
            path: error.instancePath,
            type: 'schema',
            details: error,
          });
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Find matching path item in OpenAPI spec
   * Handles path parameters like /api/v1/members/{id}
   */
  private findPathItem(requestPath: string): any {
    if (!this.api?.paths) {
      return null;
    }

    // Try exact match first
    if (this.api.paths[requestPath]) {
      return this.api.paths[requestPath];
    }

    // Try pattern matching for path parameters
    for (const [specPath, pathItem] of Object.entries(this.api.paths)) {
      const pattern = specPath.replace(/\{[^}]+\}/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(requestPath)) {
        return pathItem;
      }
    }

    return null;
  }

  /**
   * Resolve schema references ($ref)
   */
  private resolveSchema(schema: any): any {
    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/', '').split('/');
      let resolved = this.api;
      for (const part of refPath) {
        resolved = resolved[part];
      }
      return resolved;
    }
    return schema;
  }
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  message: string;
  path: string;
  type: 'path' | 'method' | 'status' | 'schema';
  details?: any;
}

/**
 * Helper function to validate Supertest response
 */
export async function validateApiResponse(
  response: Response,
  method: string,
  path: string
): Promise<ValidationResult> {
  const validator = OpenAPIValidator.getInstance();
  await validator.initialize();

  return validator.validateResponse(method, path, response.status, response.body);
}

/**
 * Jest matcher to validate response against OpenAPI spec
 */
export function expectValidApiResponse(response: Response, method: string, path: string): void {
  const validator = OpenAPIValidator.getInstance();
  const result = validator.validateResponse(method, path, response.status, response.body);

  if (!result.valid) {
    const errorMessages = result.errors
      ?.map((err) => `${err.type}: ${err.message} (${err.path})`)
      .join('\n');
    throw new Error(`Response validation failed for ${method} ${path}:\n${errorMessages}`);
  }
}
