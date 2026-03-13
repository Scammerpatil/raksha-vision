export const sendBrowserNotification = async (
  title: string,
  body: string
) => {
  if (!("Notification" in window)) {
    console.log("Browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      new Notification(title, { body });
    }
  }
};