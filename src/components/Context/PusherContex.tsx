import React, {type ReactNode, useContext} from 'react';
import Pusher from 'pusher-js';


export const PusherContext = React.createContext<Pusher | null>(null);

interface PusherProviderProps {
    children: ReactNode;
  }
  
  const PusherProvider: React.FC<PusherProviderProps> = (props) => {
  
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  });

  return (
    <PusherContext.Provider value={pusher}>
      {props.children}
    </PusherContext.Provider>
  );
};

// Custom hook to use Pusher instance
export const usePusher = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  return context;
};

export default PusherProvider;
