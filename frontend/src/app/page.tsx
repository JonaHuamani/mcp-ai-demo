import UIPlayground from './components/UIPlayground';

export default function Page() {
  const api = process.env.NEXT_PUBLIC_API || 'http://localhost:3001';
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UI Plan Playground
          </h1>
          <p className="text-gray-600">
            Generación dinámica de interfaces con IA Generativa y MCP
          </p>
        </header>
        <UIPlayground api={api} route="/home" />
      </div>
    </main>
  );
}
