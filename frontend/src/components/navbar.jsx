import logo from '../../assets/logo.png'
import profile from '../../assets/avatar.png'
const navbar = () => {
  return (
    <div className="flex justify-between items-center p-4 bg-amber-50 text-black">
      <div className="logo flex items-center gap-2">
        <img src={logo} alt="Logo" className="w-10 h-10" />
        <h1>Coding <span className="text-red-400">Hub</span></h1>
      </div>
     < div className="nav-links flex gap-6 font-weight-semibold text-m">
        {/* <a href="#" className="hover:underline underline-offset-4 decoration-red-400 hover:text-red-400">Home</a> */}
        <a href="#" className="hover:underline underline-offset-4 decoration-red-400 hover:text-red-400">plateforms</a>
        <a href="#" className="hover:underline underline-offset-4 decoration-red-400 hover:text-red-400">Contests</a>
        <a href="#" className="hover:underline underline-offset-4 decoration-red-400 hover:text-red-400">Roadmap</a>
        <a href="#" className="hover:underline underline-offset-4 decoration-red-400 hover:text-red-400">Resources</a>
        <a href="#" className="hover:underline underline-offset-4 decoration-red-400 hover:text-red-400">Blog</a>
      </div>
      <div className="flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Search..." 
          className="px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-red-400  bg-amber-100 border-b-black"
        />
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
          Login
        </button>
        <div className="proflie">
          <img src={profile} alt="A" className="w-10 h-10 rounded-full" />
        </div>
        </div>

    </div>
  )
}

export default navbar
