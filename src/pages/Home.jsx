import React from "react";
import { useAuth } from "@/lib/AuthContext";
import AdminDashboard from "@/components/Dashboard/AdminDashboard.jsx/index.jsx";
import BillingDashboard from "@/components/dashboard/BillingDashboard";
import TechnicianDashboard from "@/components/dashboard/TechnicianDashboard";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

// Role-based dashboard dispatcher. Each role lands on a dashboard built only
// around the modules and data its job requires. Admin/Manager (and the builder
// with no profile) see the full system dashboard.
export default function Home() {
  const { jobRole } = useAuth();

  switch (jobRole) {
    case "billing":
      return <BillingDashboard />;
    case "technician":
      return <TechnicianDashboard />;
    case "customer":
      return <CustomerDashboard />;
    default:
      return <AdminDashboard />;
  }
}