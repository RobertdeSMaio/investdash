export default function Login() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-sky-200 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-sky-600 mb-6 text-center">
          Login
        </h1>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="p-2 border border-sky-500 rounded-md focus:ring-2 focus:ring-sky-200 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="pass" className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              id="pass"
              name="password"
              required
              className="p-2 border border-sky-500 rounded-md focus:ring-2 focus:ring-sky-200 outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-sky-500 text-white p-2 rounded-md font-bold hover:bg-sky-600 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
