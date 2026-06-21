export default function StatsPanel({ statsCode, setStatsCode, onFetch, stats, loading }) {
  return (
    <section className="space-y-gutter">
      {/* Lookup input */}
      <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl border-2 border-surface-variant">
        <input
          value={statsCode}
          onChange={(e) => setStatsCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onFetch()}
          className="flex-grow h-14 px-6 rounded-lg border-2 border-secondary/20 focus:border-primary-container focus:ring-0 text-background font-body-lg placeholder:text-secondary-container/50"
          placeholder="Enter a short code, e.g. SXCeZc"
          type="text"
          spellCheck={false}
        />
        <button
          onClick={onFetch}
          disabled={loading}
          className="h-14 px-8 bg-primary-container text-white font-headline-md text-headline-md rounded-lg neo-shadow-navy transition-all disabled:opacity-60"
        >
          {loading ? "..." : "Fetch"}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Counter Card — real total from backend */}
          <div className="lg:col-span-4 bg-surface-container border-2 border-surface-variant p-gutter rounded-xl flex flex-col justify-center items-center text-center">
            <span className="material-symbols-outlined text-5xl text-primary mb-4">ads_click</span>
            <h3 className="text-label-caps font-label-caps text-on-surface-variant mb-2">
              TOTAL CLICKS
            </h3>
            <p className="font-display-lg text-display-lg text-on-surface">
              {stats.total_clicks.toLocaleString()}
            </p>
          </div>

          {/* Recent Clicks Table — real rows from backend */}
          <div className="lg:col-span-8 bg-white text-background rounded-xl border-2 border-surface-variant overflow-hidden shadow-xl">
            <div className="px-gutter py-base border-b border-secondary/20 flex justify-between items-center bg-secondary-fixed/30">
              <h3 className="font-headline-md text-headline-md text-on-secondary-fixed">
                Recent Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-lowest text-on-surface-variant uppercase text-label-caps font-label-caps">
                  <tr>
                    <th className="px-gutter py-4">Referrer</th>
                    <th className="px-gutter py-4">User Agent</th>
                    <th className="px-gutter py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/10">
                  {stats.recent.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-gutter py-6 text-center text-on-secondary-fixed-variant">
                        No clicks yet — share your link to see activity here.
                      </td>
                    </tr>
                  )}
                  {stats.recent.map((c, i) => (
                    <tr key={i} className="hover:bg-secondary-fixed/10 transition-colors">
                      <td className="px-gutter py-4 font-bold text-primary-container">
                        {c.referrer || "Direct"}
                      </td>
                      <td className="px-gutter py-4 text-on-secondary-fixed-variant truncate max-w-xs">
                        {c.user_agent || "—"}
                      </td>
                      <td className="px-gutter py-4 text-on-secondary-fixed-variant">
                        {c.clicked_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}