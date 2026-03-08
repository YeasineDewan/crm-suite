import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useOrders } from "@/hooks/useOrders";
import { EntityNotes } from "@/components/EntityNotes";
import { EntityHistory } from "@/components/EntityHistory";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, DollarSign, Calendar, Flag, User } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useOrders();
  const order = data.find((o) => o.id === id);

  if (isLoading) {
    return (
      <DashboardLayout title="Order Detail" subtitle="">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout title="Order Not Found" subtitle="">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">This order doesn't exist.</p>
          <Button onClick={() => navigate("/orders")}><ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={order.id} subtitle={`Order for ${order.clientName}`}>
      <Button variant="ghost" size="sm" onClick={() => navigate("/orders")} className="mb-4 gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Order Details</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.priority} />
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<User className="w-4 h-4" />} label="Client" value={order.clientName} />
              <InfoRow icon={<ShoppingCart className="w-4 h-4" />} label="Items" value={String(order.items)} />
              <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Total" value={`$${order.total.toLocaleString()}`} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date" value={order.date} />
              <InfoRow icon={<Flag className="w-4 h-4" />} label="Priority" value={order.priority} />
              {order.assignedTo && <InfoRow icon={<User className="w-4 h-4" />} label="Assigned To" value={order.assignedTo} />}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <EntityNotes entityType="order" entityId={order.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <EntityHistory entityType="order" entityId={order.id} />
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
