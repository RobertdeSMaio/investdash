export default function Register() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4 shadow-md rounded-lg">
      <div className="bg-sky-200 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-sky-600 mb-20 text-center">
          Register
        </h1>

        {/* Campo E-mail */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            className={`p-2 border rounded-lg outline-none shadow-md mb-10
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
          />
          <span className="text-red-500 text-xs"></span>
        </div>

        {/* Campo Senha */}
        <div className="flex flex-col gap-1 shadow-md rounded-lg mb-10">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            className={`p-2 border rounded-md outline-none
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
          />

          <span className="text-red-500 text-xs"></span>
        </div>
        <div className="flex flex-col gap-1 shadow-md rounded-lg mb-10">
          <label htmlFor="password">Repetir senha</label>
          <input
            type="password"
            id="password"
            className={`p-2 border rounded-md outline-none
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
          />

          <span className="text-red-500 text-xs"></span>
        </div>

        <button
          type="submit"
          className="mt-2 bg-sky-500 text-white p-2 rounded-md font-bold hover:bg-sky-600 transition-colors"
        >
          Registrar
        </button>
      </div>
    </main>
  );
}
