# Testing Guide for purse-backend

## Overview

This project uses Jest. Runtime data access is Prisma/MySQL, so tests should mock
`src/config/prismaClient.js` or higher-level services. Do not import or mock
`src/models/*`; the old Mongoose model layer has been removed.

## Running Tests

```bash
npm test
npm run test:watch
npm run test:coverage
npm test -- __tests__/services/order.service.test.js
```

## Current Test Areas

- `__tests__/services/order.service.test.js`
- `__tests__/services/notification.service.test.js`
- `__tests__/controllers/order.controller.test.js`
- `__tests__/controllers/admin.controller.test.js`
- `__tests__/integration/orderManagement.test.js`

## Prisma Mock Pattern

```javascript
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

var mockPrisma;

jest.mock("../../src/config/prismaClient.js", () => ({
  __esModule: true,
  default: (mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  }),
}));

import * as userService from "../../src/services/customer.service.js";

describe("customer service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads a user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: "user@test.com" });

    const result = await userService.getCustomerProfile(1);

    expect(result.id).toBe(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalled();
  });
});
```

## Mocking Services

```javascript
jest.mock("../../src/services/notification.service.js", () => ({
  __esModule: true,
  default: {
    createNotification: jest.fn(),
  },
}));
```

## Express Response Mock

```javascript
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};
```

## Notes

- Keep unit tests isolated from the real database.
- Use `jest.clearAllMocks()` between tests.
- Prefer testing returned behavior and important Prisma calls over internal implementation detail.
- Add Supertest API coverage once a dedicated test database is available.
