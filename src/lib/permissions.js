// Role-based access control for QoraxSolar Somalia.
// The authorized Admin/Manager (platform admin or Employee role admin/manager)
// has full access. Other roles see only the modules relevant to their job.

export const ROLES = ["admin", "manager", "technician", "billing", "customer"];

export const ROLE_LABELS = {
  admin: "Maamulaha",
  manager: "Maareeyaha",
  technician: "Farsamaha",
  billing: "Billing",
  customer: "Macmiil",
};

export const ROLE_DESCRIPTIONS = {
  admin: "Maamul buuxa ah dhammaan qaybaha",
  manager: "Maamul buuxa ah dhammaan qaybaha",
  technician: "Qalabka, ciladaha, dayactirka iyo hawlaha",
  billing: "Billing, lacagaha, kharashaadka iyo macaamiisha",
  customer: "Akawntaaga gaarka ah uun",
};

// Route paths each job role may access. "*" means full access.
export const ROLE_ROUTES = {
  admin: "*",
  manager: "*",
  // Technicians: equipment, alarms, maintenance, tasks, notifications only.
  technician: ["/", "/qalabka", "/ciladaha", "/dayactir", "/hawlaha", "/ogeysiisyada"],
  // Billing staff: customers, invoices, payments, tariffs, reports, usage, notifications.
  billing: ["/", "/macaamiisha", "/billing", "/lacagaha", "/qiimaynta", "/warbixin", "/warbixin-isticmaalka", "/isticmaalka", "/ogeysiisyada"],
  // Customers: their own account, bills, payments, usage, solar info, notifications.
  customer: ["/", "/macaamiisha", "/billing", "/lacagaha", "/isticmaalka", "/xogta-qoraxda", "/ogeysiisyada"],
};

export function isAdminRole(role) {
  return role === "admin" || role === "manager";
}

export function canAccess(role, path) {
  if (!role) return false;
  const routes = ROLE_ROUTES[role];
  if (!routes) return false;
  if (routes === "*") return true;
  return routes.some((r) => path === r || path.startsWith(r + "/"));
}

export function filterNavByRole(role, navItems) {
  if (!role) return [];
  if (isAdminRole(role)) return navItems;
  return navItems.filter((item) => canAccess(role, item.path));
}