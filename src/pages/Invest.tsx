import { useState } from "react";

export default function Invest() {
  const [addInv, setAddInv] = useState(null);

  return (
    <>
      <div className="shadow-md rounded-lg p-1 bg-sky-50">
        <label htmlFor="inv"></label>
        <input
          className="p-2 border rounded-lg"
          type="inv"
          placeholder="Seu investimento"
        />
        <button
          className="m-2 rounded-lg p-1 border hover:bg-sky-200"
          onClick={() => setAddInv}
        >
          Insira
        </button>
        {addInv}
      </div>
      <div className="shadow-md rounded-lg p-1 mt-3 bg-sky-50">
        /*TODO lista de investimentos */
      </div>
    </>
  );
}
