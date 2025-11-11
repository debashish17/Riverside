const Joi = require('joi');

class ValidationSchemas {
  static get auth() {
    return {
      register: Joi.object({
        email: Joi.string().email().required().messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
          'string.min': 'Password must be at least 6 characters long',
          'any.required': 'Password is required'
        }),
        username: Joi.string().min(3).max(50).required().messages({
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username must be less than 50 characters',
          'any.required': 'Username is required'
        })
      }),
      
      login: Joi.object({
        email: Joi.string().email().required().messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
        password: Joi.string().required().messages({
          'any.required': 'Password is required'
        })
      })
    };
  }

  static get session() {
    return {
      create: Joi.object({
        sessionName: Joi.string().min(1).max(100).required().messages({
          'string.min': 'Session name cannot be empty',
          'string.max': 'Session name must be less than 100 characters',
          'any.required': 'Session name is required'
        }),
        projectId: Joi.number().integer().positive().required().messages({
          'number.base': 'Project ID must be a number',
          'number.integer': 'Project ID must be an integer',
          'number.positive': 'Project ID must be positive',
          'any.required': 'Project ID is required'
        }),
        maxParticipants: Joi.number().integer().min(2).max(50).default(10).messages({
          'number.base': 'Max participants must be a number',
          'number.integer': 'Max participants must be an integer',
          'number.min': 'At least 2 participants required',
          'number.max': 'Maximum 50 participants allowed'
        }),
        isPublic: Joi.boolean().default(false),
        description: Joi.string().max(500).optional().messages({
          'string.max': 'Description must be less than 500 characters'
        })
      }),
      
      join: Joi.object({
        sessionId: Joi.number().integer().positive().required().messages({
          'number.base': 'Session ID must be a number',
          'number.integer': 'Session ID must be an integer',
          'number.positive': 'Session ID must be positive',
          'any.required': 'Session ID is required'
        }),
        username: Joi.string().min(1).max(50).required().messages({
          'string.min': 'Username cannot be empty',
          'string.max': 'Username must be less than 50 characters',
          'any.required': 'Username is required'
        })
      })
    };
  }

  static get recording() {
    return {
      upload: Joi.object({
        sessionId: Joi.number().integer().positive().optional().messages({
          'number.base': 'Session ID must be a number',
          'number.integer': 'Session ID must be an integer',
          'number.positive': 'Session ID must be positive'
        }),
        sessionName: Joi.string().max(100).optional().messages({
          'string.max': 'Session name must be less than 100 characters'
        }),
        projectId: Joi.number().integer().positive().required().messages({
          'number.base': 'Project ID must be a number',
          'number.integer': 'Project ID must be an integer',
          'number.positive': 'Project ID must be positive',
          'any.required': 'Project ID is required'
        })
      }),
      
      query: Joi.object({
        projectId: Joi.number().integer().positive().optional(),
        sessionId: Joi.number().integer().positive().optional(),
        limit: Joi.number().integer().min(1).max(100).default(50),
        offset: Joi.number().integer().min(0).default(0),
        sortBy: Joi.string().valid('uploadedAt', 'size', 'sessionName').default('uploadedAt'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
      })
    };
  }

  static get project() {
    return {
      create: Joi.object({
        name: Joi.string().min(1).max(100).required().messages({
          'string.min': 'Project name cannot be empty',
          'string.max': 'Project name must be less than 100 characters',
          'any.required': 'Project name is required'
        }),
        description: Joi.string().max(500).optional().messages({
          'string.max': 'Description must be less than 500 characters'
        }),
        isPublic: Joi.boolean().default(false)
      }),
      
      update: Joi.object({
        name: Joi.string().min(1).max(100).optional().messages({
          'string.min': 'Project name cannot be empty',
          'string.max': 'Project name must be less than 100 characters'
        }),
        description: Joi.string().max(500).optional().messages({
          'string.max': 'Description must be less than 500 characters'
        }),
        isPublic: Joi.boolean().optional()
      })
    };
  }

  static get user() {
    return {
      update: Joi.object({
        username: Joi.string().min(3).max(50).optional().messages({
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username must be less than 50 characters'
        }),
        email: Joi.string().email().optional().messages({
          'string.email': 'Please provide a valid email address'
        }),
        currentPassword: Joi.string().when('newPassword', {
          is: Joi.exist(),
          then: Joi.required(),
          otherwise: Joi.optional()
        }).messages({
          'any.required': 'Current password is required when changing password'
        }),
        newPassword: Joi.string().min(6).optional().messages({
          'string.min': 'New password must be at least 6 characters long'
        })
      })
    };
  }
}

module.exports = ValidationSchemas;