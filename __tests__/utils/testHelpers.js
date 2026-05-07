// Test utilities and helpers
export const mockOrderData = {
  validOrder: {
    orderNumber: 'ORD-20260414-1234',
    user: 'user123',
    store: 'store123',
    items: [
      {
        product: 'prod1',
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000,
      },
    ],
    customer: {
      name: 'John Doe',
      email: 'john@test.com',
      phone: '08012345678',
    },
    shippingAddress: {
      label: 'Home',
      state: 'Lagos',
      city: 'Ikeja',
      address: '123 Main Street',
    },
    currentStatus: 'Order Received',
    payment: {
      subtotal: 50000,
      shipping: 2000,
      tax: 5000,
      total: 57000,
    },
  },

  invalidOrder: {
    // Missing required fields
    user: 'user123',
    items: [],
  },

  cancelledOrder: {
    currentStatus: 'Cancelled',
    cancelReason: 'Customer request',
  },
};

export const mockNotificationData = {
  orderReceived: {
    type: 'order_received',
    title: 'Order Confirmed',
    message: 'Your order has been received and is being processed',
    metadata: {
      orderId: 'order123',
    },
  },

  orderShipped: {
    type: 'order_shipped',
    title: 'Order Shipped',
    message: 'Your order is on the way',
    metadata: {
      orderId: 'order123',
      trackingNumber: 'TRACK123',
    },
  },

  vendorApproved: {
    type: 'vendor_approved',
    title: 'Welcome to NextGenPurse!',
    message: 'Your vendor application has been approved',
  },

  vendorRejected: {
    type: 'vendor_rejected',
    title: 'Application Status Update',
    message: 'Your vendor application has been rejected',
    metadata: {
      reason: 'Incomplete documents',
    },
  },
};

export const mockUserData = {
  customer: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@test.com',
    password: 'SecurePassword123!',
    phoneNumber: '08012345678',
    role: 'customer',
  },

  vendor: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'vendor@test.com',
    password: 'SecurePassword123!',
    phoneNumber: '07098765432',
    role: 'vendor',
    onboardingStep: 'approved',
  },

  admin: {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    password: 'AdminPassword123!',
    role: 'admin',
  },
};

export const mockStatusTransitions = {
  validTransitions: [
    { from: 'Order Received', to: 'Processing' },
    { from: 'Processing', to: 'In Transit' },
    { from: 'In Transit', to: 'Out for Delivery' },
    { from: 'Out for Delivery', to: 'Delivered' },
  ],

  cancellableStatuses: ['Order Received', 'Processing'],
  nonCancellableStatuses: ['In Transit', 'Out for Delivery', 'Delivered'],
};

// Helper function to create mock middleware
export const createMockRequest = (overrides = {}) => ({
  user: { _id: 'user123', role: 'customer' },
  params: {},
  body: {},
  query: {},
  ...overrides,
});

export const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Helper to generate order number
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
};

// Helper to validate order structure
export const validateOrderStructure = (order) => {
  const requiredFields = [
    'orderNumber',
    'user',
    'store',
    'items',
    'currentStatus',
    'payment',
    'createdAt',
  ];

  return requiredFields.every((field) => field in order);
};

// Helper to validate notification structure
export const validateNotificationStructure = (notification) => {
  const requiredFields = [
    'user',
    'type',
    'title',
    'isRead',
    'createdAt',
  ];

  return requiredFields.every((field) => field in notification);
};

// Setup and teardown helpers
export const setupTestDatabase = async () => {
  // Mock database connection
  return Promise.resolve();
};

export const teardownTestDatabase = async () => {
  // Clean up after tests
  return Promise.resolve();
};

// Time helpers for testing
export const getFutureDate = (days = 1) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const getPastDate = (days = 1) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Assert helpers
export const assertOrderWasCancelled = (order) => {
  expect(order.currentStatus).toBe('Cancelled');
  expect(order.cancelledAt).toBeDefined();
};

export const assertNotificationWasSent = (notification, type) => {
  expect(notification).toBeDefined();
  expect(notification.type).toBe(type);
  expect(notification.isRead).toBe(false);
};

export const assertVendorWasApproved = (vendor) => {
  expect(vendor.onboardingStep).toBe('approved');
  expect(vendor.isVerified).toBe(true);
};
