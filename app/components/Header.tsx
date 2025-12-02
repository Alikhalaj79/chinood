import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full py-2 px-4 md:px-6 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">
          پردیس گستر چینود
        </h1>
        <div className="w-24 md:w-32 h-auto flex-shrink-0">
          <Image
            src="/logo.svg"
            alt="لوگو چینود"
            width={128}
            height={110}
            priority
            className="w-full h-auto"
            unoptimized
          />
        </div>
      </div>
    </header>
  );
}
