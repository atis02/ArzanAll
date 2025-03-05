
import NetInfo from "@react-native-community/netinfo";
import { useState, useEffect } from "react";

export function useConnectivity() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
}
