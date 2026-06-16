import jwt from "jsonwebtoken";

const secret = "supersecrettestkeythatislongerthanthirtytwocharacters";
const payload = { id: 1, role: "rider", scope: "rider_onboarding" };

const token = jwt.sign(payload, secret);
console.log("Token:", token);

try {
  const decoded = jwt.verify(token, secret);
  console.log("Decoded:", decoded);
} catch (e) {
  console.error("Error:", e);
}
