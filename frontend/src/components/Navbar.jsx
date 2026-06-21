export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b-2 border-surface-variant">
      <nav className="flex justify-between items-center px-container-padding py-base w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="font-display-lg text-display-lg-mobile font-extrabold text-primary-container">
            BitURL
          </span>
        </div>
        <div className="hidden md:flex items-center gap-gutter">
          <a
            className="text-primary border-b-2 border-primary pb-1 font-headline-md text-headline-md transition-all"
            href="#"
          >
            Dashboard
          </a>
        </div>
      </nav>
    </header>
  );
}