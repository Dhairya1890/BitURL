import { useState } from "react";
import { API_BASE } from "./config";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ResultCard from "./components/ResultCard";
import StatsPanel from "./components/StatsPanel";
import Footer from "./components/Footer";

export default function App() {
  const [longUrl, setLongUrl] = useState("");
  const [shortCode, setShortCode] = useState(null);
  const [statsCode, setStatsCode] = useState("");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [shortenLoading, setShortenLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  async function handleShorten() {
    setError(null);
    setShortCode(null);
    if (!longUrl.trim()) {
      setError("Please paste a URL first.");
      return;
    }
    setShortenLoading(true);
    try {
      const res = await fetch(`${API_BASE}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ long_url: longUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Something went wrong. Please try again.");
        return;
      }
      setShortCode(data.short_code);
    } catch (e) {
      setError("Couldn't reach the server. Is the backend running?");
    } finally {
      setShortenLoading(false);
    }
  }

  async function handleStats() {
    setError(null);
    setStats(null);

    let code = statsCode.trim();
    if (code.includes("/")) {
      code = code.split("/").filter(Boolean).pop();
    }

    if (!code) {
      setError("Enter a short code to look up.");
      return;
    }

    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${code}/stats`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "No link found with that code.");
        return;
      }
      setStats(data);
    } catch (e) {
      setError("Couldn't reach the server.");
    } finally {
      setStatsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-section-gap px-container-padding max-w-7xl mx-auto relative bg-grid-pattern">
        <Hero
          longUrl={longUrl}
          setLongUrl={setLongUrl}
          onShorten={handleShorten}
          loading={shortenLoading}
        />

        <ResultCard shortCode={shortCode} />

        <StatsPanel
          statsCode={statsCode}
          setStatsCode={setStatsCode}
          onFetch={handleStats}
          stats={stats}
          loading={statsLoading}
        />

        {error && (
          <div className="max-w-2xl mx-auto mt-gutter px-gutter py-4 bg-primary-container/10 border-2 border-primary-container rounded-xl text-primary text-center font-bold">
            {error}
          </div>
        )}

        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px] pointer-events-none"></div>
      </main>
      <Footer />
    </>
  );
}