import type { MainLayoutProps } from "../types/types";

export const MainLayout = ({ top, middle, bottom }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header>
        {/* You can add a header or navbar here if needed */}
        {top}
      </header>
      <main className="flex-grow container mx-auto px-4 py-6">{middle}</main>
      <footer className="bg-gray-100 text-center mt-6">{bottom}</footer>
    </div>
  );
};
