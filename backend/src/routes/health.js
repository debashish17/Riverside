const express = require('express');
const router = express.Router();
const { prisma } = require('../services/database');
const s3Config = require('../config/s3');
const environment = require('../config/environment');
const ErrorHandler = require('../middleware/errorHandler');

class HealthRoutes {
  static getRouter() {
    // Basic health check
    router.get('/', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: environment.env,
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Detailed health check
    router.get('/detailed', 
      ErrorHandler.async(async (req, res) => {
        const healthStatus = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: environment.env,
          version: process.env.npm_package_version || '1.0.0',
          services: {
            database: { status: 'unknown' },
            s3: { status: 'unknown' },
            memory: { status: 'unknown' }
          }
        };

        // Check database health
        try {
          await prisma.$queryRaw`SELECT 1`;
          healthStatus.services.database = {
            status: 'healthy',
            lastChecked: new Date().toISOString()
          };
        } catch (error) {
          healthStatus.services.database = {
            status: 'unhealthy',
            error: error.message,
            lastChecked: new Date().toISOString()
          };
        }

        // Check S3 configuration
        healthStatus.services.s3 = {
          status: s3Config.isEnabled() ? 'configured' : 'disabled',
          enabled: s3Config.isEnabled(),
          bucket: s3Config.isEnabled() ? s3Config.getBucketName() : null,
          lastChecked: new Date().toISOString()
        };

        // Check memory usage
        const memoryUsage = process.memoryUsage();
        const memoryThreshold = 500 * 1024 * 1024; // 500MB threshold
        healthStatus.services.memory = {
          status: memoryUsage.heapUsed < memoryThreshold ? 'healthy' : 'warning',
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
          lastChecked: new Date().toISOString()
        };

        // Determine overall status
        const hasUnhealthy = Object.values(healthStatus.services)
          .some(service => service.status === 'unhealthy');
        
        if (hasUnhealthy) {
          healthStatus.status = 'degraded';
        }

        const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(healthStatus);
      })
    );

    // Database connectivity check
    router.get('/database', 
      ErrorHandler.async(async (req, res) => {
        try {
          const startTime = Date.now();
          await prisma.$queryRaw`SELECT 1`;
          const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - startTime}ms`
          };
          res.status(200).json(health);
        } catch (error) {
          res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      })
    );

    // S3 configuration check
    router.get('/s3', (req, res) => {
      const s3Status = {
        enabled: s3Config.isEnabled(),
        configured: s3Config.isEnabled(),
        bucket: s3Config.isEnabled() ? s3Config.getBucketName() : null,
        timestamp: new Date().toISOString()
      };

      res.json(s3Status);
    });

    // System metrics
    router.get('/metrics', (req, res) => {
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          usage: process.memoryUsage(),
          formatted: {
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`
          }
        },
        cpu: {
          usage: process.cpuUsage()
        },
        platform: {
          arch: process.arch,
          platform: process.platform,
          version: process.version,
          versions: process.versions
        }
      };

      res.json(metrics);
    });

    return router;
  }
}

module.exports = HealthRoutes.getRouter();