import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useEmployees } from "@/hooks/useEmployees";
import { EntityNotes } from "@/components/EntityNotes";
import { EntityHistory } from "@/components/EntityHistory";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Briefcase, Building2, Calendar, TrendingUp } from "lucide-react";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useEmployees();
  const employee = data.find((e) => e.id === id);

  if (isLoading) {
    return (
      <DashboardLayout title="Employee Detail" subtitle="">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout title="Employee Not Found" subtitle="">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">This employee doesn't exist.</p>
          <Button onClick={() => navigate("/employees")}><ArrowLeft className="w-4 h-4 mr-1" /> Back to Employees</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={employee.name} subtitle={employee.role}>
      <Button variant="ghost" size="sm" onClick={() => navigate("/employees")} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">{employee.avatar}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.role}</p>
                </div>
              </div>
              <StatusBadge status={employee.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={employee.email} />
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Department" value={employee.department} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Join Date" value={employee.joinDate} />
              <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Role" value={employee.role} />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Performance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${employee.performance}%` }} />
                </div>
                <span className="text-sm font-semibold text-foreground">{employee.performance}%</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <EntityNotes entityType="employee" entityId={employee.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <EntityHistory entityType="employee" entityId={employee.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
