import Link from 'next/link';
import { Clock, User } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="hidden md:flex fixed left-0 top-0 h-full w-16 bg-white border-r-2 border-black flex-col items-center py-6 z-40">
      {/* Logo/Icon at top */}
      <Link href="/" className="mb-auto">
        <div className="w-10 h-10 bg-[#6B9EE8] rounded-lg flex items-center justify-center hover:bg-[#5A8DD6] transition-colors">
          <Clock className="w-6 h-6 text-white" />
        </div>
      </Link>

      {/* Profile button at bottom */}
      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#F7F9FC] transition-colors">
        <User className="w-5 h-5 text-[#1F1F1F]" />
      </button>
    </div>
  );
}
