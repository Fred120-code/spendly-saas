import React, { useEffect } from "react";

interface NotificationProps {
  message: string;
  onclose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onclose }) => {

    useEffect(()=>{
        const time = setTimeout(() => {
            onclose()
        }, 3000);

        return ()=> clearTimeout(time)
    }, [onclose])

  return (
    <div className="toast toast-bottom toast-start mb-5 ml-10">
      <div className="alert p-2 text-sm">
        <span className="flex items-center">{message}</span>
      </div>
    </div>
  );
};

export default Notification;
