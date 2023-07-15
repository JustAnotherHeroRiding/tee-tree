import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { dark } from '@clerk/themes';
import { HomePageProvider } from "~/components/Context/HomePageContext";
import UserContextProvider from "~/components/Context/UserContext";




const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps} appearance={{
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      baseTheme: dark
    }}>
      <UserContextProvider>
      <HomePageProvider>
      <Head>
        <title>Tee-tree</title>
        <meta name="description" content="First t3 stack app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
    </HomePageProvider>
    </UserContextProvider>
    </ClerkProvider>
  )
};

export default api.withTRPC(MyApp);
