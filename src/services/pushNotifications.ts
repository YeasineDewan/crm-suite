import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { toast } from "sonner";

let initialized = false;
  if (!Capacitor.isNativePlatform() || initialized) return;
  initialized = true;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== "granted") {
    console.warn("Push notification permission not granted");
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener("registration", (token) => {
    console.log("Push registration token:", token.value);
    // TODO: Send token to backend for targeted notifications
  });

  PushNotifications.addListener("registrationError", (error) => {
    console.error("Push registration error:", error);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push notification received:", notification);
    // Show in-app notification via toast/sonner
    const { toast } = require("sonner");
    toast(notification.title ?? "Notification", {
      description: notification.body ?? "",
    });
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("Push notification action:", action);
    // Handle navigation based on notification data
    const data = action.notification.data;
    if (data?.route) {
      window.location.href = data.route;
    }
  });
}

/**
 * Check for low stock items and new orders — used on native to schedule local alerts.
 * On web this is a no-op.
 */
export function checkNotificationTriggers(context: {
  lowStockCount: number;
  newOrderCount: number;
}) {
  if (!Capacitor.isNativePlatform()) return;

  // These would typically be handled server-side via push,
  // but we log the triggers for debugging
  if (context.lowStockCount > 0) {
    console.log(`[Notifications] ${context.lowStockCount} low-stock items detected`);
  }
  if (context.newOrderCount > 0) {
    console.log(`[Notifications] ${context.newOrderCount} new/pending orders detected`);
  }
}
