export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "on-leave" | "inactive";
  joinDate: string;
  avatar: string;
  performance: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "prospect";
  totalSpent: number;
  lastContact: string;
}

export interface Order {
  id: string;
  clientName: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  priority: "low" | "medium" | "high";
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastRestocked: string;
}

export const employees: Employee[] = [
  { id: "E001", name: "Sarah Johnson", email: "sarah@company.com", role: "Sales Manager", department: "Sales", status: "active", joinDate: "2023-01-15", avatar: "SJ", performance: 92 },
  { id: "E002", name: "Michael Chen", email: "michael@company.com", role: "Developer", department: "Engineering", status: "active", joinDate: "2023-03-22", avatar: "MC", performance: 88 },
  { id: "E003", name: "Emily Davis", email: "emily@company.com", role: "Designer", department: "Design", status: "on-leave", joinDate: "2022-11-01", avatar: "ED", performance: 95 },
  { id: "E004", name: "James Wilson", email: "james@company.com", role: "Account Executive", department: "Sales", status: "active", joinDate: "2024-01-10", avatar: "JW", performance: 78 },
  { id: "E005", name: "Lisa Anderson", email: "lisa@company.com", role: "HR Specialist", department: "HR", status: "active", joinDate: "2023-07-18", avatar: "LA", performance: 85 },
  { id: "E006", name: "Robert Taylor", email: "robert@company.com", role: "CTO", department: "Engineering", status: "active", joinDate: "2021-06-01", avatar: "RT", performance: 97 },
  { id: "E007", name: "Amanda White", email: "amanda@company.com", role: "Marketing Lead", department: "Marketing", status: "active", joinDate: "2023-09-05", avatar: "AW", performance: 91 },
  { id: "E008", name: "David Brown", email: "david@company.com", role: "Support Agent", department: "Support", status: "inactive", joinDate: "2022-04-12", avatar: "DB", performance: 72 },
];

export const clients: Client[] = [
  { id: "C001", name: "Acme Corp", company: "Acme Corporation", email: "contact@acme.com", phone: "+1 555-0101", status: "active", totalSpent: 125000, lastContact: "2026-03-05" },
  { id: "C002", name: "TechStart Inc", company: "TechStart", email: "hello@techstart.io", phone: "+1 555-0102", status: "active", totalSpent: 89000, lastContact: "2026-03-02" },
  { id: "C003", name: "Global Solutions", company: "Global Solutions Ltd", email: "info@globalsol.com", phone: "+1 555-0103", status: "active", totalSpent: 234000, lastContact: "2026-03-07" },
  { id: "C004", name: "Sunrise Media", company: "Sunrise Media Group", email: "biz@sunrise.com", phone: "+1 555-0104", status: "prospect", totalSpent: 0, lastContact: "2026-02-28" },
  { id: "C005", name: "BlueWave Tech", company: "BlueWave Technologies", email: "sales@bluewave.com", phone: "+1 555-0105", status: "active", totalSpent: 67500, lastContact: "2026-03-06" },
  { id: "C006", name: "Summit Group", company: "Summit Advisory Group", email: "team@summit.com", phone: "+1 555-0106", status: "inactive", totalSpent: 45000, lastContact: "2026-01-15" },
  { id: "C007", name: "Horizon Labs", company: "Horizon Laboratories", email: "lab@horizon.com", phone: "+1 555-0107", status: "active", totalSpent: 178000, lastContact: "2026-03-04" },
];

export const orders: Order[] = [
  { id: "ORD-001", clientName: "Acme Corp", items: 5, total: 12500, status: "delivered", date: "2026-03-01", priority: "high" },
  { id: "ORD-002", clientName: "TechStart Inc", items: 3, total: 8900, status: "shipped", date: "2026-03-03", priority: "medium" },
  { id: "ORD-003", clientName: "Global Solutions", items: 12, total: 45000, status: "processing", date: "2026-03-05", priority: "high" },
  { id: "ORD-004", clientName: "BlueWave Tech", items: 2, total: 3200, status: "pending", date: "2026-03-07", priority: "low" },
  { id: "ORD-005", clientName: "Horizon Labs", items: 8, total: 28000, status: "processing", date: "2026-03-06", priority: "high" },
  { id: "ORD-006", clientName: "Acme Corp", items: 1, total: 5600, status: "delivered", date: "2026-02-20", priority: "medium" },
  { id: "ORD-007", clientName: "Summit Group", items: 4, total: 15800, status: "cancelled", date: "2026-02-15", priority: "low" },
  { id: "ORD-008", clientName: "TechStart Inc", items: 6, total: 22400, status: "shipped", date: "2026-03-04", priority: "medium" },
  { id: "ORD-009", clientName: "Global Solutions", items: 3, total: 9800, status: "pending", date: "2026-03-08", priority: "high" },
];

export const inventory: InventoryItem[] = [
  { id: "INV-001", name: "Enterprise License", sku: "LIC-ENT-001", category: "Software", quantity: 150, price: 2500, status: "in-stock", lastRestocked: "2026-03-01" },
  { id: "INV-002", name: "Pro Subscription", sku: "SUB-PRO-001", category: "Software", quantity: 8, price: 499, status: "low-stock", lastRestocked: "2026-02-15" },
  { id: "INV-003", name: "Hardware Kit A", sku: "HW-KIT-A01", category: "Hardware", quantity: 45, price: 1200, status: "in-stock", lastRestocked: "2026-02-28" },
  { id: "INV-004", name: "Support Package", sku: "SUP-PKG-001", category: "Services", quantity: 200, price: 800, status: "in-stock", lastRestocked: "2026-03-05" },
  { id: "INV-005", name: "Hardware Kit B", sku: "HW-KIT-B01", category: "Hardware", quantity: 0, price: 1800, status: "out-of-stock", lastRestocked: "2026-01-10" },
  { id: "INV-006", name: "Basic License", sku: "LIC-BAS-001", category: "Software", quantity: 500, price: 299, status: "in-stock", lastRestocked: "2026-03-03" },
  { id: "INV-007", name: "Training Module", sku: "TRN-MOD-001", category: "Services", quantity: 5, price: 1500, status: "low-stock", lastRestocked: "2026-02-01" },
  { id: "INV-008", name: "Server Component", sku: "HW-SRV-001", category: "Hardware", quantity: 22, price: 3500, status: "in-stock", lastRestocked: "2026-03-06" },
];

export const revenueData = [
  { month: "Sep", revenue: 42000, orders: 28 },
  { month: "Oct", revenue: 53000, orders: 35 },
  { month: "Nov", revenue: 48000, orders: 31 },
  { month: "Dec", revenue: 61000, orders: 42 },
  { month: "Jan", revenue: 55000, orders: 38 },
  { month: "Feb", revenue: 67000, orders: 45 },
  { month: "Mar", revenue: 72000, orders: 52 },
];

export const departmentData = [
  { name: "Sales", employees: 12, color: "hsl(210, 100%, 50%)" },
  { name: "Engineering", employees: 18, color: "hsl(168, 80%, 42%)" },
  { name: "Design", employees: 6, color: "hsl(262, 83%, 58%)" },
  { name: "Marketing", employees: 8, color: "hsl(38, 92%, 50%)" },
  { name: "Support", employees: 10, color: "hsl(0, 72%, 51%)" },
];
