import ReactPlayer from 'react-player'
import 'primeicons/primeicons.css'
import guide1 from './assets/guide-1.png'
import guide2 from './assets/guide-2.png'
import guide3 from './assets/guide-3.png'

export default function Guide() {
  return (
    <div className='bg-light rounded-4 p-3'>
      <h2>Guide</h2>
      <hr/>

      <div className='row'>
        <div className="d-flex justify-content-center mb-4 p-3">
          <ReactPlayer 
            url='https://www.youtube.com/watch?v=kSd3E6FfEeo'
          />
        </div>
        <hr/>
        
        <div className='col-5'>
          <div className='pb-3'>
          <h4>Basic Usage</h4>
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
            <li>Throughout the site, additional information can be accessed by hovering over or clicking on the <i className='pi pi-question-circle'></i> icon where available.</li>
            <li>For a selected number of indicators, additional technical information were created. <a href='#tech-note-1'>Technical Note 1</a> about "Managing over time changing boundaries and harmonising boundaries from round 1 (NFHS4) to round 2 (NFHS-5) and national official boundaries to enable over time comparisons" can be accessed here and through the drop-down menu on the top right bar of this site.</li>
          </ol>
          </div>

          <div>
          <h4>Filtering by change</h4>
          <ol start={9}>
            <li>Once clicking on Change and District level under Layers, a "Filter by Change" drop-down menu appears. Use the dropdown to display subnational units with significant improvement or worsening through time for the selected indicator.</li>
            <li>Once the selection has been made, a slider bar showing different levels of significance appears. The slider allows the user to choose the probability that there is meaningful improvement/worsening. The map filters out units where it is unlikely that there have been meaningful improvements.</li>
            <li>Additional information can be found by clicking on the <i className='pi pi-question-circle'></i> icon on top of the change significance slider.</li>
            <li>An illustration and <a href='#tech-note-2'>Technical Note 2</a> providing details on "Exceedance Probability and Confidence in Changes Over Time" can be accessed from here and also by using the drop-down "Technical Note" menu on the top right bar of this site.</li>
          </ol>
          </div>
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
  