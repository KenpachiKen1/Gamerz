import { notification } from "antd";

type NotificationType = "success" | "info" | "warning" | "error";

const useNotifications = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = (
    type: NotificationType,
    title: string,
    desc?: string
  ) => {
    api[type]({
      message: title,
      description: desc,
      placement: "topRight",
    });
  };

  return { showNotification, contextHolder };
};

export default useNotifications;
