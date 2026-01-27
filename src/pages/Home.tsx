import NavBar from "../componentes/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-gray-100 p-8 flex flex-col gap-4">
        <div className="bg-sky-300 p-6 rounded-lg flex-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-sky-200 aspect-square rounded-lg shadow-sm">
              <div>
                <h1 className="flex-1 p-6">About</h1>
                <h3></h3>
              </div>
            </div>

            <div className="bg-sky-200 aspect-square rounded-lg shadow-sm">
              <h1 className="p-6">Dashboard - investiments</h1>
              <h3></h3>
            </div>

            <div className="bg-sky-200 aspect-square rounded-lg shadow-sm">
              <h1 className="p-6">Calculators</h1>
              <h3></h3>
              <div className="bg-sky-100 p-8 flex-1 m-8 rounded-lg shadow-sm">
                Juros Compostos
              </div>
              <div className="bg-sky-100 p-8 flex-1 m-8 rounded-lg shadow-sm">
                Juros Simples
              </div>
              <div className="bg-sky-100 p-8 flex-1 m-8 rounded-lg shadow-sm">
                Primeiro milhão
              </div>
              <div className="bg-sky-100 p-8 flex-1 m-8 rounded-lg shadow-sm">
                Porcentagem
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
