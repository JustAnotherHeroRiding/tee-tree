import React, { createContext, useState, useContext, type PropsWithChildren } from 'react';
import type { NextPage } from 'next';

const HomePageContext = createContext<{
  homePage: boolean;
  setHomePage: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  homePage: true,
  setHomePage: () => undefined,
});

export const useHomePage = () => {
  return useContext(HomePageContext);
};

export const HomePageProvider: NextPage<PropsWithChildren> = (props) => {
    const [homePage, setHomePage] = useState(true);
  
    return (
      <HomePageContext.Provider value={{ homePage, setHomePage }}>
        {props.children}
      </HomePageContext.Provider>
    );
  };
  