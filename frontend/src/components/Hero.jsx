export default function Hero({ longUrl, setLongUrl, onShorten, loading }) {
  return (
    <section className="text-center mb-section-gap relative">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-gutter max-w-4xl mx-auto leading-tight">
        Shorten your <span className="relative inline-block">links</span>, track every click.
      </h1>
      <div className="relative inline-block mb-12">
        <p className="text-on-surface-variant font-body-lg max-w-xl mx-auto">
          The only link management platform you’ll ever need. Powerful analytics, custom
          domains, and hand-sketched simplicity.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl border-2 border-surface-variant shadow-2xl relative">
          <input
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onShorten()}
            className="flex-grow h-16 px-6 rounded-lg border-2 border-secondary/20 focus:border-primary-container focus:ring-0 text-background font-body-lg placeholder:text-secondary-container/50"
            placeholder="Paste a long URL here"
            type="text"
            spellCheck={false}
          />
          <button
            onClick={onShorten}
            disabled={loading}
            className="h-16 px-10 bg-primary-container text-white font-headline-md text-headline-md rounded-lg neo-shadow-navy transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "..." : "Shorten"}
          </button>
        </div>
      </div>
    </section>
  );
}