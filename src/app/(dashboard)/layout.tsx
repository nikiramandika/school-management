import Menu from "@/components/Menu"
import Navbar from "@/components/Navbar"
import Link from "next/link"
import Image from "next/image"

export default function DashboardLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="h-screen flex">
            <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
                <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
                <Image 
                    src="https://smanlimedan.sch.id/wp-content/uploads/2024/07/LOGO_2-removebg-prev._imresizer-removebg-preview.png" 
                    alt="logo" 
                    width={32} 
                    height={32}
                    unoptimized
                />
                <span className="hidden lg:block">SMAN 5 Medan</span>
                </Link>
                <Menu/>
            </div>
            <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#f7f8fa] overflow-scroll flex flex-col">
                <Navbar/>
                {children}
            </div>
        </div>
    )
  }