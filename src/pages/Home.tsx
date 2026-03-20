import { Link } from "react-router-dom";
import Dash from "../componentes/dash";

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 bg-sky-300 gap-6 p-6 rounded-lg">
      <div className="bg-sky-200 rounded-lg shadow-sm">
        <h1 className="p-6">Dashboard - investiments</h1>
        <Dash />
      </div>

      <div className="bg-sky-200 rounded-lg shadow-sm">
        <h1 className="p-6">Calculators</h1>
        <h3></h3>
        <Link to="/composej">
          <div className="bg-sky-100 p-15 flex-1 m-8 rounded-lg shadow-sm hover:bg-sky-300 transition-colors">
            Juros Compostos
          </div>
        </Link>
        <Link to="/simplej">
          <div className="bg-sky-100 p-15 flex-1 m-8 rounded-lg shadow-sm hover:bg-sky-300 transition-colors">
            Juros Simples
          </div>
        </Link>
        <Link to="/invest">
          <div className="bg-sky-100 p-15 flex-1 m-8 rounded-lg shadow-sm hover:bg-sky-300 transition-colors">
            Investimentos
          </div>
        </Link>
      </div>
    </div>
  );
}
