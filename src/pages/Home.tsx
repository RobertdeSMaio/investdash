import { Link } from "react-router-dom";
import Dash from "../componentes/dash";
import Invest from "../componentes/Investiments";
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
                <h1 className="flex-1 p-6">Investiments</h1>
                <div>
                  <Invest />
                </div>
              </div>
            </div>

            <div className="bg-sky-200 aspect-square rounded-lg shadow-sm">
              <h1 className="p-6">Dashboard - investiments</h1>
              <Dash />
            </div>

            <div className="bg-sky-200 aspect-square rounded-lg shadow-sm">
              <h1 className="p-6">Calculators</h1>
              <h3></h3>
              <Link to="/ComposeJ">
                <div className="bg-sky-100 p-8 flex-1 m-8 rounded-lg shadow-sm hover:bg-sky-300 transition-colors">
                  Juros Compostos
                </div>
              </Link>
              <Link to="/SimpleJ">
                <div className="bg-sky-100 p-8 flex-1 m-8 rounded-lg shadow-sm hover:bg-sky-300 transition-colors">
                  Juros Simples
                </div>
              </Link>
              <Link to="/M1Calc">
                <div className="bg-sky-100 p-8 flex-1 m-8 rounded-lg shadow-sm hover:bg-sky-300 transition-colors">
                  Primeiro milhão
                </div>
              </Link>
              <Link to="/Porcent">
                <div className="bg-sky-100 p-8 flex-1 m-8 rounded-lg shadow-sm hover:bg-sky-300 transition-colors">
                  Porcentagem
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
