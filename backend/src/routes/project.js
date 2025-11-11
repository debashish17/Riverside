const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middleware/auth');
const ErrorHandler = require('../middleware/errorHandler');
const ValidationSchemas = require('../validation/schemas');
const { prisma } = require('../services/database');

class ProjectRoutes {
  static getRouter() {
    // Get all projects for authenticated user
    router.get('/', 
      AuthMiddleware.authenticate,
      ErrorHandler.async(async (req, res) => {
        
        
        try {
          const projects = await prisma.project.findMany({
            where: {
              OR: [
                { owner: req.user.email },
                { isPublic: true }
              ]
            },
            include: {
              recordings: {
                select: {
                  id: true,
                  filename: true,
                  uploadedAt: true,
                  size: true
                },
                orderBy: {
                  uploadedAt: 'desc'
                },
                take: 5 // Latest 5 recordings
              },
              _count: {
                select: {
                  recordings: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          });
          
          res.json({
            success: true,
            projects,
            total: projects.length
          });
        } catch (error) {
          // Fallback to simple response if database fails
          res.json({
            success: true,
            projects: [],
            total: 0,
            message: 'Database not available, using local storage'
          });
        }
      })
    );

    // Get specific project by ID
    router.get('/:id', 
      AuthMiddleware.authenticate,
      ErrorHandler.async(async (req, res) => {
        
        const projectId = parseInt(req.params.id);
        
        try {
          const project = await prisma.project.findFirst({
            where: {
              id: projectId,
              OR: [
                { owner: req.user.email },
                { isPublic: true }
              ]
            },
            include: {
              recordings: {
                orderBy: {
                  uploadedAt: 'desc'
                }
              },
              _count: {
                select: {
                  recordings: true
                }
              }
            }
          });
          
          if (!project) {
            return res.status(404).json({
              success: false,
              message: 'Project not found or access denied'
            });
          }
          
          res.json({
            success: true,
            project
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Failed to retrieve project',
            error: error.message
          });
        }
      })
    );

    // Create new project
    router.post('/', 
      AuthMiddleware.authenticate,
      ErrorHandler.validation(ValidationSchemas.project.create),
      ErrorHandler.async(async (req, res) => {
        
        const { name, description, isPublic } = req.body;
        
        try {
          const project = await prisma.project.create({
            data: {
              name,
              description,
              isPublic: isPublic || false,
              owner: req.user.email,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          res.status(201).json({
            success: true,
            project,
            message: 'Project created successfully'
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
          });
        }
      })
    );

    // Update project
    router.put('/:id', 
      AuthMiddleware.authenticate,
      ErrorHandler.validation(ValidationSchemas.project.update),
      ErrorHandler.async(async (req, res) => {
        
        const projectId = parseInt(req.params.id);
        const { name, description, isPublic } = req.body;
        
        try {
          // Check if user owns the project
          const existingProject = await prisma.project.findFirst({
            where: {
              id: projectId,
              owner: req.user.email
            }
          });
          
          if (!existingProject) {
            return res.status(404).json({
              success: false,
              message: 'Project not found or access denied'
            });
          }
          
          const project = await prisma.project.update({
            where: { id: projectId },
            data: {
              ...(name && { name }),
              ...(description !== undefined && { description }),
              ...(isPublic !== undefined && { isPublic }),
              updatedAt: new Date()
            }
          });
          
          res.json({
            success: true,
            project,
            message: 'Project updated successfully'
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message
          });
        }
      })
    );

    // Delete project
    router.delete('/:id', 
      AuthMiddleware.authenticate,
      ErrorHandler.async(async (req, res) => {
        
        const projectId = parseInt(req.params.id);
        
        try {
          // Check if user owns the project
          const existingProject = await prisma.project.findFirst({
            where: {
              id: projectId,
              owner: req.user.email
            }
          });
          
          if (!existingProject) {
            return res.status(404).json({
              success: false,
              message: 'Project not found or access denied'
            });
          }
          
          // Delete project and all associated recordings
          await prisma.project.delete({
            where: { id: projectId }
          });
          
          res.json({
            success: true,
            message: 'Project deleted successfully'
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: error.message
          });
        }
      })
    );

    return router;
  }
}

module.exports = ProjectRoutes.getRouter();
