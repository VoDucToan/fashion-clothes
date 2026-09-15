export type PaymentProvider = "VNPAY" | "COD";

export type ShippingAddress = {
  fullName: string;
  phone: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  street: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "shipping"
  | "completed"
  | "cancelled"
  | "refunded";
