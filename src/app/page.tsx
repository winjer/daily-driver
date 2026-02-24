import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-slate-100 mb-4">Daily Driver</h1>
      <Dashboard />
    </main>
  );
}
