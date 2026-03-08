import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { toast } from "sonner";

let initialized = false;

export async function initPushNotifications() {
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
    toast(notification.title ?? "Notification", {
      description: notification.body ?? "",
    });
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    console.log("Push notification action:", action);
    const data = action.notification.data;
    if (data?.route) {
      window.location.href = data.route;
    }
  });
}

export function checkNotificationTriggers(context: {
  lowStockCount: number;
  newOrderCount: number;
}) {
  if (!Capacitor.isNativePlatform()) return;

  if (context.lowStockCount > 0) {
    console.log(`[Notifications] ${context.lowStockCount} low-stock items detected`);
  }
  if (context.newOrderCount > 0) {
    console.log(`[Notifications] ${context.newOrderCount} new/pending orders detected`);
  }
}
