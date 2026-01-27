import NavBar from "../componentes/NavBar";

export default function M1() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-sky-300 p-6 rounded-lg flex-0 m-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 m-5">
          <div className="bg-sky-200 aspect-square rounded-lg shadow-sm flex-1 "></div>
          <div className="bg-sky-200 aspect-square rounded-lg shadow-sm flex-1 "></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 m-5">
          <div className="bg-sky-200 aspect-square rounded-lg shadow-sm flex-1 "></div>
          <div className="bg-sky-200 aspect-square rounded-lg shadow-sm flex-1 "></div>
        </div>
        <div className="bg-sky-200 aspect-square rounded-lg shadow-sm grid flex-1"></div>
      </div>
    </>
  );
}
