import { Routes, Route, Outlet, Link } from 'react-router-dom'
import { Nav, Navbar } from 'react-bootstrap'
import logoWP from './assets/wp_navy.png'
import logoCIFF from './assets/logo_ciff.png'
import About from './About'
import Guide from './Guide'
import Technical from './Technical'
import MainApp from './MainApp'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'primeicons/primeicons.css'

export default function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<MainApp />} />
          <Route path='about' element={<About />} />
          <Route path='guide' element={<Guide />} />
          <Route path='tech-note' element={<Technical />} />
          <Route path='*' element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  return (
    <div>
      <div className='shadow mb-4'>
        <div className='container-xxl px-5'>
          <Navbar expand='lg'>
            <Navbar.Brand href='./'>
              <div className='hstack gap-3' style={{height:'40px'}}>
                <img alt='logoWP' src={logoWP} height='40px'/>
                <div className='vr'></div>
                <img alt='logoCIFF' src={logoCIFF} height='40px'/>
              </div>
            </Navbar.Brand>
            <Navbar.Toggle />

            <Navbar.Collapse className='justify-content-end'>
              <Nav>
                <Nav.Link href='./'><i className='pi pi-home m-2'></i>Home</Nav.Link>
                <Nav.Link href='./about'><i className='pi pi-info-circle m-2'></i>About</Nav.Link>
                <Nav.Link href='./guide'><i className='pi pi-question-circle m-2'></i>Guide</Nav.Link>
                <Nav.Link href='./tech-note'><i className='pi pi-book m-2'></i>Tech Note</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>

      <div className='container-xxl px-5' style={{paddingBottom:'50px'}}>
        <Outlet />
      </div>

      <div className='shadow fixed-bottom p-2 justify-content-end'>
        &copy; 2024 <a href='https://sdi.worldpop.org'>WorldPop SDI</a>
      </div>
    </div>
  );
}

function Main() {
  return (
    <></>
  )
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to='/'>Go to the home page</Link>
      </p>
    </div>
  );
}
