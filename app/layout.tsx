import "./globals.css";
import PWARegister from "../components/PWARegister";
export const metadata={title:"RAJA BUNDELA — Digital Creator • Developer • AI Enthusiast",description:"Official website of ANJUL RAJA BUNDELA.",manifest:"/manifest.webmanifest"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<PWARegister/></body></html>}