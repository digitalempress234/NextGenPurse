export const toIntId = (value, label = "id") => {
  const raw = String(value ?? "").trim().replace(/^:/, "");
  const id = Number.parseInt(raw, 10);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error(`Invalid ${label}`) as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  return id;
};

export const idOf = (value, label = "id") => {
  if (value && typeof value === "object") {
    return toIntId(value.id ?? value._id, label);
  }

  return toIntId(value, label);
};

export const withMongoId = (value) => {
  if (Array.isArray(value)) {
    return value.map(withMongoId);
  }

  if (!value || typeof value !== "object" || value instanceof Date) {
    return value;
  }

  const output: any = {};
  for (const [key, child] of Object.entries(value)) {
    output[key] = withMongoId(child);
  }

  if (Object.prototype.hasOwnProperty.call(value, "id")) {
    output._id = String(value.id);
  }

  return output;
};

export const withoutPassword = (user) => {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const userPublicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  phoneNumber: true,
  avatar: true,
  isEmailVerified: true,
  onboardingStep: true,
  isVerified: true,
  isActive: true,
  state: true,
  city: true,
  address: true,
  createdAt: true,
  updatedAt: true,
};

export const formatOrder = (order) => {
  if (!order) return order;

  return withMongoId({
    ...order,
    user: order.user ?? order.userId,
    store: order.store ?? order.storeId,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    shippingAddress: {
      label: order.shippingLabel,
      state: order.shippingState,
      city: order.shippingCity,
      address: order.shippingAddress,
    },
  });
};

export const normalizeOrderCreate = ({ userId, storeId, user, shippingAddress = {}, cart, subtotal, shippingFee, taxAmount, total, orderNumber }) => ({
  orderNumber,
  userId,
  storeId,
  customerName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  customerEmail: user.email,
  customerPhone: user.phoneNumber ? String(user.phoneNumber) : null,
  shippingLabel: (shippingAddress as any).label ?? null,
  shippingState: (shippingAddress as any).state ?? null,
  shippingCity: (shippingAddress as any).city ?? null,
  shippingAddress: (shippingAddress as any).address ?? null,
  currency: cart.currency || "NGN",
  subtotal,
  shippingFee,
  taxAmount,
  total,
});
