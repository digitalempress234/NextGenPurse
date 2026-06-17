import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/config/prismaClient.js";

describe("Rider Registration and Onboarding Flow", () => {
  const riderEmail = "test-rider@example.com";
  let onboardingToken;
  let userId;

  beforeAll(async () => {
    // Robust cleanup
    const user = await prisma.user.findUnique({ where: { email: riderEmail } });
    if (user) {
      await prisma.riderProfile.deleteMany({ where: { userId: user.id } });
      await prisma.riderDocument.deleteMany({ where: { userId: user.id } });
      await prisma.riderBankAccount.deleteMany({ where: { userId: user.id } });
      await prisma.wallet.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Step 1: Register Rider", async () => {
    const res = await request(app)
      .post("/api/riders/register")
      .send({ email: riderEmail });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.userId).toBeDefined();
    userId = res.body.userId;

    const user = await prisma.user.findUnique({ where: { email: riderEmail } });
    expect(user.role).toBe("rider");
    expect(user.onboardingStep).toBe("created");
    expect(user.emailVerificationOTP).toBeDefined();
  }, 20000);

  test("Step 2: Verify OTP", async () => {
    const user = await prisma.user.findUnique({ where: { email: riderEmail } });
    const otp = user.emailVerificationOTP;

    const res = await request(app)
      .post("/api/riders/verify-otp")
      .send({ email: riderEmail, otp });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.token).toBeDefined();
    onboardingToken = res.body.token;
    console.log("Token set in test variable:", onboardingToken);

    const updatedUser = await prisma.user.findUnique({ where: { email: riderEmail } });
    expect(updatedUser.isEmailVerified).toBe(true);
    expect(updatedUser.onboardingStep).toBe("verified");
  }, 20000);

  test("Step 3: Update Profile (Vehicle Info)", async () => {
    const res = await request(app)
      .put("/api/riders/profile")
      .set("Authorization", `Bearer ${onboardingToken}`)
      .send({
        firstName: "Test",
        lastName: "Rider",
        vehicleType: "Motorcycle",
        vehicleNumber: "TEST-123",
        password: "securePassword123"
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    const updatedUser = await prisma.user.findUnique({ where: { email: riderEmail } });
    expect(updatedUser.onboardingStep).toBe("rider_updated");
    expect(updatedUser.firstName).toBe("Test");

    const profile = await prisma.riderProfile.findUnique({ where: { userId: updatedUser.id } });
    expect(profile.vehicleNumber).toBe("TEST-123");
  });

  test("Step 4: Upload Document", async () => {
    const res = await request(app)
      .post("/api/riders/documents")
      .set("Authorization", `Bearer ${onboardingToken}`)
      .send({
        type: "LICENSE",
        url: "http://example.com/license.jpg"
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");

    const updatedUser = await prisma.user.findUnique({ where: { email: riderEmail } });
    expect(updatedUser.onboardingStep).toBe("documents_uploaded");
  });

  test("Step 5: Set Bank Account", async () => {
    const res = await request(app)
      .post("/api/riders/bank-account")
      .set("Authorization", `Bearer ${onboardingToken}`)
      .send({
        bankName: "Test Bank",
        accountNumber: "1234567890",
        accountName: "Test Rider"
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    const updatedUser = await prisma.user.findUnique({ where: { email: riderEmail } });
    expect(updatedUser.onboardingStep).toBe("bank_account_set");
  });

  test("Step 6: Submit for Review", async () => {
    const res = await request(app)
      .post("/api/riders/submit")
      .set("Authorization", `Bearer ${onboardingToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    const updatedUser = await prisma.user.findUnique({ where: { email: riderEmail } });
    expect(updatedUser.onboardingStep).toBe("under_review");
  });

  test("Final: Application Status", async () => {
    const res = await request(app)
      .get("/api/riders/application-status")
      .set("Authorization", `Bearer ${onboardingToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.onboardingStep).toBe("under_review");
  });

  test("Rider cannot login until approved", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: riderEmail,
        password: "securePassword123"
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Complete onboarding before login");
  });
});
