import { useEffect } from "react";
import { socket } from "../services/socket";

/* -------------------- Types -------------------- */

type SocketCallback<T = any> = (payload: T) => void;

/* -------------------- Hook -------------------- */

export const useSocket = <T = any>(
  eventName: string,
  callback: SocketCallback<T>,
  deps: React.DependencyList = [],
) => {
  useEffect(() => {
    if (!eventName || !callback) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback, ...deps]);

  return socket;
};
