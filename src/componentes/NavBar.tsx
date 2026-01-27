import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="w-full h-13 p-4 shadow-md flex justify-between items-center bg-sky-200 rounded-[10px]">
      <h3 className="font-bold">InvesterDash</h3>
      <div className="flex gap-6 items-center">
        <Link to="/Home" className="hover:text-sky-100 transition-colors">
          Home
        </Link>
        <Link to="/about" className="hover:text-sky-100 transition-colors">
          About
        </Link>
        <Link
          to="/"
          className="bg-white text-sky-400 px-4 py-1 rounded-md font-bold hover:bg-sky-50 transition-colors"
        >
          Logout
        </Link>
      </div>
    </header>
  );
}
