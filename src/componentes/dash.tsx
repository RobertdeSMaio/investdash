import { type ApexOptions } from "apexcharts"; // O 'type' aqui mata o erro do tsconfig
import { useState } from "react";
import Chart from "react-apexcharts";

export default function Dash() {
  const [ticker, setTicker] = useState("");
  const [series, setSeries] = useState<{ name: string; data: number[] }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!ticker) return;
    const token = import.meta.env.VITE_BRAPI_TOKEN;

    try {
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker}?range=7d&interval=1d&token=${token}`,
      );
      const data = await response.json();

      if (data.results?.[0]?.historicalDataPrice) {
        const prices = data.results[0].historicalDataPrice.map(
          (item: any) => item.close,
        );
        const dates = data.results[0].historicalDataPrice.map((item: any) =>
          new Date(item.date * 1000).toLocaleDateString(),
        );

        setSeries([{ name: ticker.toUpperCase(), data: prices }]);
        setCategories(dates);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
    }
  };

  const options: ApexOptions = {
    chart: { id: "finance-chart" },
    xaxis: { categories: categories }, // Agora você está LENDO a variável categories
  };

  return (
    <div className="p-2 bg-white m-10 shadow-md rounded-lg">
      <input
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Ex: PETR4"
      />
      <button onClick={handleSearch}>Buscar</button>

      <Chart
        options={options}
        series={series} // Agora você está LENDO a variável series
        type="line"
        height={350}
      />
    </div>
  );
}
