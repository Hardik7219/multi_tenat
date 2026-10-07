
import { SessionProvider } from "next-auth/react";


export default function Home({children,}:{children:React.ReactNode}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
