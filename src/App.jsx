import { Routes, Route, Outlet, Link } from 'react-router-dom'
import { Nav, Navbar, Modal, NavDropdown } from 'react-bootstrap'
import logoWP from './assets/wp_navy.png'
import logoCIFF from './assets/logo_ciff.png'
import MainApp from './MainApp'
import About from './About'
import Guide from './Guide'
import Technical from './Technical'

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
          <Route path='tech-note-1' element={<Technical which='boundary' />} />
          <Route path='tech-note-2' element={<Technical which='exceedance' />} />
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
        <div className='container-xl px-2'>
          <Navbar expand='md'>
            <Navbar.Brand href='./'>
              <div className='hstack gap-3' style={{height:'40px'}}>
                <img alt='logoWP' src={logoWP} height='40px'/>
                <div className='vr'></div>
                <img alt='logoCIFF' src={logoCIFF} height='30px'/>
              </div>
            </Navbar.Brand>
            <Navbar.Toggle />

            <Navbar.Collapse className='justify-content-end'>
              <Nav>
                <Nav.Link href='./'><i className='pi pi-home mx-1'></i>Home</Nav.Link>
                <Nav.Link href='#about'><i className='pi pi-info-circle mx-1'></i>About</Nav.Link>
                <Nav.Link href='#guide'><i className='pi pi-question-circle mx-1'></i>Guide</Nav.Link>
                <NavDropdown href='' title={<span><i className='pi pi-book mx-1'></i>Tech Note</span>}>
                  <NavDropdown.Item href='#tech-note-1'>Technical Note 1</NavDropdown.Item>
                  <NavDropdown.Item href='#tech-note-2'>Technical Note 2</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>

      <div className='container-xl px-2' style={{paddingBottom:'50px'}}>
        <Outlet />
      </div>

      <div className='shadow p-2 justify-content-end'>
        &copy; 2024 <a href='https://sdi.worldpop.org'>WorldPop SDI</a>
      </div>
    </div>
  );
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
