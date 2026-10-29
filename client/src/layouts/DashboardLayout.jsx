import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

function DashboardLayout({ children }) {

  return (

    <div className="d-flex">

      <Sidebar />

      <div className="flex-grow-1">

        <Navbar />

        <div className="container-fluid p-4">
          {children}
        </div>

      </div>

    </div>

  )
}

export default DashboardLayout