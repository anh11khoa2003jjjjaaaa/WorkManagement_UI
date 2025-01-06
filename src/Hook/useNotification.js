import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const useNotification = (userId) => {
  const [notifications, setNotifications] = useState([]); // Lưu danh sách thông báo
  const [connection, setConnection] = useState(null); // Quản lý kết nối SignalR

  useEffect(() => {
    // Khởi tạo kết nối SignalR
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7093/notificationHub") // Địa chỉ Hub từ backend
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (connection) connection.stop();
    };
  }, []); // Chỉ khởi tạo một lần khi component được mount

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("SignalR connected");

          // Nhận thông báo từ SignalR
          connection.on("ReceiveNotification", (title, content) => {
            setNotifications((prev) => [
              ...prev,
              { title, content, isRead: false, timestamp: new Date() },
            ]);
          });
        })
        .catch((err) => console.error("SignalR connection error:", err));
    }
  }, [connection]);

  return notifications;
};

export default useNotification;
