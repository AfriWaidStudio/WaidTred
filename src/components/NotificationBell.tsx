import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

const NotificationBell = () => {
  const navigate = useNavigate();
  const unread = 3; // Mock

  return (
    <button onClick={() => navigate("/dashboard/notifications")} className="relative p-2 rounded-xl hover:bg-secondary/50 transition-colors">
      <Bell className="w-5 h-5 text-muted-foreground" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
          {unread}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
