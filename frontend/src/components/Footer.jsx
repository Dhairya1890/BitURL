export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t-2 border-surface-variant mt-section-gap">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-container-padding py-gutter w-full">
        <div className="mb-gutter md:mb-0 text-center md:text-left">
          <p className="font-headline-md text-headline-md text-on-surface mb-2">BitURL</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 BitURL. Built for speed.
          </p>
        </div>
        <div className="flex gap-gutter">
          <a
            className="text-on-surface-variant hover:text-primary transition-colors font-body-sm text-body-sm"
            href="https://www.linkedin.com/in/dhairya-sharma-80565532a/"
          >
            Connect With Me
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-colors font-body-sm text-body-sm"
            href="https://github.com/Dhairya1890/BitURL"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
