import 'primeicons/primeicons.css'
import guide1 from './assets/guide-1.png'
import guide2 from './assets/guide-2.png'
import guide3 from './assets/guide-3.png'

export default function Guide() {
  return (
    <div>
      <div className='row'>
        <div className='col-5'>
          <ol>
            <li>Select a country and indicator to display. A subnational map of the indicator will be displayed on the left.</li>
            <li>By default, indicator value from the Round 1 survey is displayed on the map.</li>
            <ul>
              <li>Click <kbd>Round 2</kbd> to see the value from the Round 2 survey.</li>
              <li>Click <kbd>Change</kbd> to see the difference between the values from two rounds.</li>
              <li>Click <kbd>Grid Level</kbd> to load the grid level data (5x5 km).</li>
            </ul>

            <li>Click <i className="pi pi-plus-circle"></i> or <i className="pi pi-minus-circle"></i> to zoom-in or zoom-out the map. Click <i className='pi pi-home'></i> to reset the map view.</li>

            <li>Select an administrative unit from the list provided. Selection can also be done by clicking any region on the map.</li>
            <li>Chart and tabulated data for the selected unit is displayed on the right. The data can be sorted according to the sub-unit name or the indicator values.</li>
            <li>The aggregated values of all indicators from the selected unit can also be seen on the panel.</li>
          </ol>
        </div>

        <div className='col-7 text-center'>
          <img alt='guide' src={guide1} width='100%'/>
          <img alt='guide' src={guide2} width='98%'/>
          <img alt='guide' src={guide3} width='98%'/>
        </div>
      </div>
    </div>
  );
}
  