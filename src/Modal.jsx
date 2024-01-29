import { Modal } from 'react-bootstrap'
import About from './About'
import Guide from './Guide'
import Technical from './Technical'

export default function ShowModal(param){
    function modalContent(val){
        const path = {
          '': <></>,
          'about': <About />,
          'guide': <Guide />,
          'tech-note': <Technical />
        }
    
        return (
          <div>
            {path[val]}
          </div>
        )
    }

    return (
        <Modal show={param} size='lg' fullscreen='down' onHide={() => setParam(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{param}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {modalContent(param)}
            </Modal.Body>
        </Modal>
    )
}