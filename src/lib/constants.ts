export const BATCH_STATUSES = {
  CREATED: { label: "Created", color: "bg-gray-100 text-gray-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-800" },
  QC_PENDING: { label: "QC Pending", color: "bg-yellow-100 text-yellow-800" },
  QC_APPROVED: { label: "QC Approved", color: "bg-green-100 text-green-800" },
  QC_REJECTED: { label: "QC Rejected", color: "bg-red-100 text-red-800" },
  PACKAGED: { label: "Packaged", color: "bg-purple-100 text-purple-800" },
  SHIPPED: { label: "Shipped", color: "bg-indigo-100 text-indigo-800" },
  RECALLED: { label: "Recalled", color: "bg-red-200 text-red-900" },
} as const;

export const FIELD_TYPES = [
  "NUMBER",
  "TEXT",
  "BOOLEAN",
  "SELECT",
  "DATETIME",
] as const;

export const PRODUCT_CATEGORIES = {
  jerky: { label: "Jerky", icon: "Beef" },
  chips: { label: "Chips", icon: "Cookie" },
  puffs: { label: "Puffs", icon: "Popcorn" },
} as const;
