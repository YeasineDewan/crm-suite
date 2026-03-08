import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useClients } from "@/hooks/useClients";
import { EntityNotes } from "@/components/EntityNotes";
import { EntityHistory } from "@/components/EntityHistory";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Building2, DollarSign, Calendar } from "lucide-react";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useClients();
  const client = data.find((c) => c.id === id);

  if (isLoading) {
    return (
      <DashboardLayout title="Client Detail" subtitle="">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout title="Client Not Found" subtitle="">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">This client doesn't exist.</p>
          <Button onClick={() => navigate("/clients")}><ArrowLeft className="w-4 h-4 mr-1" /> Back to Clients</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={client.name} subtitle={client.company}>
      <Button variant="ghost" size="sm" onClick={() => navigate("/clients")} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Client Information</h3>
              <StatusBadge status={client.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={client.email} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={client.phone} />
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company" value={client.company} />
              <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Total Spent" value={`$${client.totalSpent.toLocaleString()}`} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Last Contact" value={client.lastContact} />
              {client.assignedTo && <InfoRow icon={<Building2 className="w-4 h-4" />} label="Assigned To" value={client.assignedTo} />}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <EntityNotes entityType="client" entityId={client.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <EntityHistory entityType="client" entityId={client.id} />
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
