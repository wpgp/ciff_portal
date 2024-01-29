import { Routes, Route, Outlet, Link } from 'react-router-dom'
import { Nav, Navbar, Modal } from 'react-bootstrap'
import logoWP from './assets/wp_navy.png'
import logoCIFF from './assets/logo_ciff.png'
import MainApp from './MainApp'
import About from './About'
import Guide from './Guide'
import Technical from './Technical'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'primeicons/primeicons.css'
import { useState } from 'react'

function modalContent(val){
  const path = {
    '': <></>,
    'About': <About />,
    'Guide': <Guide />,
    'Technical Note': <Technical />
  }

  return (
    <div>
      {path[val]}
    </div>
  )
}

export default function App() {
  return (
    <div>
      <Routes>
        <Route path='/ciff_portal/' element={<Layout />}>
          <Route index element={<MainApp />} />
          <Route path='*' element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  const [optModal, setOptModal] = useState('')
  return (
    <div>
      <div className='shadow mb-4'>
        <div className='container-lg px-2'>
          <Navbar expand='md'>
            <Navbar.Brand href='./'>
              <div className='hstack gap-3' style={{height:'40px'}}>
                <img alt='logoWP' src={logoWP} height='30px'/>
                <div className='vr'></div>
                <img alt='logoCIFF' src={logoCIFF} height='30px'/>
              </div>
            </Navbar.Brand>
            <Navbar.Toggle />

            <Navbar.Collapse className='justify-content-end'>
              <Nav>
                <Nav.Link href='./'><i className='pi pi-home m-2'></i>Home</Nav.Link>
                <Nav.Link href='#' onClick={() => {setOptModal('About')}}><i className='pi pi-info-circle m-2'></i>About</Nav.Link>
                <Nav.Link href='#' onClick={() => {setOptModal('Guide')}}><i className='pi pi-question-circle m-2'></i>Guide</Nav.Link>
                <Nav.Link href='#' onClick={() => {setOptModal('Technical Note')}}><i className='pi pi-book m-2'></i>Tech Note</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <Modal show={optModal} size='lg' fullscreen={true} onHide={() => setOptModal('')}>
            <Modal.Header closeButton>
                <Modal.Title><h2>{optModal}</h2></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {modalContent(optModal)}
            </Modal.Body>
          </Modal>
        </div>
      </div>

      <div className='container-lg px-2' style={{paddingBottom:'50px'}}>
        <Outlet />
      </div>

      <div className='shadow fixed-bottom p-2 justify-content-end'>
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
