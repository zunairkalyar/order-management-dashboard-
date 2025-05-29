import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

interface ValidationError {
  field: string;
  message: string;
}

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors: ValidationError[] = errors.array().map(error => ({
    field: error.param,
    message: error.msg
  }));

  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors: formattedErrors
  });
};

export const validation = {
  order: {
    create: [
      body('customerName').trim().notEmpty().withMessage('Customer name is required'),
      body('items').isArray().withMessage('Items must be an array'),
      body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
      body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
      body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
      body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
      body('status').isIn(['pending', 'processing', 'completed', 'cancelled'])
        .withMessage('Invalid status')
    ],
    update: [
      body('customerName').optional().trim().notEmpty(),
      body('items').optional().isArray(),
      body('items.*.name').optional().trim().notEmpty(),
      body('items.*.quantity').optional().isInt({ min: 1 }),
      body('items.*.price').optional().isFloat({ min: 0 }),
      body('total').optional().isFloat({ min: 0 }),
      body('status').optional().isIn(['pending', 'processing', 'completed', 'cancelled'])
    ]
  },
  customer: {
    create: [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('whatsappNumber').trim().notEmpty().withMessage('WhatsApp number is required')
        .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid WhatsApp number format'),
      body('email').optional().isEmail().withMessage('Invalid email format')
    ],
    update: [
      body('name').optional().trim().notEmpty(),
      body('whatsappNumber').optional().trim()
        .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid WhatsApp number format'),
      body('email').optional().isEmail().withMessage('Invalid email format')
    ]
  },
  bulk: {
    updateStatus: [
      body('orderIds').isArray().withMessage('Order IDs must be an array')
        .notEmpty().withMessage('Order IDs cannot be empty'),
      body('status').isIn(['pending', 'processing', 'completed', 'cancelled'])
        .withMessage('Invalid status')
    ],
    sendMessages: [
      body('orderIds').isArray().notEmpty(),
      body('messageTemplate').trim().notEmpty()
        .withMessage('Message template is required')
    ]
  }
};
