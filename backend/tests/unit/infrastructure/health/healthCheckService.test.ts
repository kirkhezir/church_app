/**
 * Health Check Service Unit Tests
 *
 * Note: These tests focus on the service behavior when properly mocked.
 * Integration tests should be used for full end-to-end health checking.
 */

describe('HealthCheckService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should be importable', async () => {
      // Dynamic import to avoid module initialization issues
      const module = await import('../../../../src/infrastructure/health/healthCheckService');
      expect(module.healthCheckService).toBeDefined();
    });

    it('should have required methods', async () => {
      const module = await import('../../../../src/infrastructure/health/healthCheckService');
      const service = module.healthCheckService;

      expect(typeof service.getHealthStatus).toBe('function');
      expect(typeof service.getSimpleHealth).toBe('function');
      expect(typeof service.isReady).toBe('function');
      expect(typeof service.isAlive).toBe('function');
    });

    it('isAlive should return true when service is running', async () => {
      const module = await import('../../../../src/infrastructure/health/healthCheckService');
      const service = module.healthCheckService;

      // isAlive is a synchronous check that always returns true
      expect(service.isAlive()).toBe(true);
    });
  });

  describe('getSimpleHealth', () => {
    it('should return timestamp', async () => {
      const module = await import('../../../../src/infrastructure/health/healthCheckService');
      const service = module.healthCheckService;

      const health = await service.getSimpleHealth();
      expect(health).toHaveProperty('timestamp');
      expect(typeof health.timestamp).toBe('string');
    });
  });
});
