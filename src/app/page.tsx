
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold text-black mb-4">
        Nairobi Emergency Response
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Official county disaster management system. Please access the emergency portal via our official WhatsApp service.
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/webview?phone_number=%2B254712345678" className="w-full">
          <Button className="w-full bg-black text-white hover:bg-gray-800 py-6 text-lg rounded-xl">
            Open Webview Demo
          </Button>
        </Link>
      </div>
      
      <p className="mt-12 text-xs text-gray-400 font-bold uppercase tracking-widest">
        Nairobi City County Government
      </p>
    </div>
  );
}
