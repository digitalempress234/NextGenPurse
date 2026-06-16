import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/config/prismaClient.js";

describe("Vendor Registration and Onboarding Flow", () => {
  const vendorEmail = "test-vendor@example.com";
  let onboardingToken;
  let userId;

  beforeAll(async () => {
    // Robust cleanup
    const user = await prisma.user.findUnique({ where: { email: vendorEmail } });
    if (user) {
      await prisma.store.deleteMany({ where: { vendorId: user.id } });
      await prisma.vendorProfile.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Step 1: Register Vendor", async () => {
    const res = await request(app)
      .post("/api/vendors/register")
      .send({ email: vendorEmail });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    userId = res.body.data.userId;

    const user = await prisma.user.findUnique({ where: { email: vendorEmail } });
    expect(user.role).toBe("vendor");
    expect(user.onboardingStep).toBe("created");
  });

  test("Step 2: Verify OTP", async () => {
    const user = await prisma.user.findUnique({ where: { email: vendorEmail } });
    const otp = user.emailVerificationOTP;

    const res = await request(app)
      .post("/api/vendors/verify-otp")
      .send({ email: vendorEmail, otp });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.token).toBeDefined();
    onboardingToken = res.body.data.token;
  });

  test("Step 3: Update Profile", async () => {
    const res = await request(app)
      .post("/api/vendors/profile")
      .set("Authorization", `Bearer ${onboardingToken}`)
      .send({
        firstName: "Test",
        lastName: "Vendor",
        phoneNumber: "08012345678",
        state: "Lagos",
        city: "Ikeja",
        address: "123 Commerce St"
      });

    expect(res.status).toBe(200);
    const updatedUser = await prisma.user.findUnique({ where: { email: vendorEmail } });
    expect(updatedUser.onboardingStep).toBe("vendor_updated");
  });

  test("Step 4: Create Store", async () => {
    // Ensure we have at least one category
    let category = await prisma.category.findFirst();
    if (!category) {
        category = await prisma.category.create({ data: { name: "Test Category", level: 1 } });
    }

    const res = await request(app)
      .post("/api/vendors/store")
      .set("Authorization", `Bearer ${onboardingToken}`)
      .send({
        storeName: "Test Store",
        category: category.id, // Changed from categoryId
        state: "Lagos",
        city: "Ikeja",
        address: "123 Commerce St"
      });

    expect(res.status).toBe(200);
    const updatedUser = await prisma.user.findUnique({ where: { email: vendorEmail } });
    expect(updatedUser.onboardingStep).toBe("store_created");
  });

  test("Step 5: Set Password", async () => {
    const res = await request(app)
      .post("/api/vendors/set-password")
      .set("Authorization", `Bearer ${onboardingToken}`)
      .send({ password: "securePassword123" });

    expect(res.status).toBe(200);
    const updatedUser = await prisma.user.findUnique({ where: { email: vendorEmail } });
    expect(updatedUser.onboardingStep).toBe("password_set");
  });

  test("Step 6: Upload Documents", async () => {
    const res = await request(app)
      .post("/api/vendors/documents")
      .set("Authorization", `Bearer ${onboardingToken}`)
      .send({
        documents: ["https://example.com/doc1.pdf"]
      });

    expect(res.status).toBe(200);
    const updatedUser = await prisma.user.findUnique({ where: { email: vendorEmail } });
    expect(updatedUser.onboardingStep).toBe("documents_uploaded");
  });

  test("Step 7: Submit for Review", async () => {
    const res = await request(app)
      .post("/api/vendors/submit")
      .set("Authorization", `Bearer ${onboardingToken}`);

    expect(res.status).toBe(200);
    const updatedUser = await prisma.user.findUnique({ where: { email: vendorEmail } });
    expect(updatedUser.onboardingStep).toBe("under_review");
  });
});
