import { OverlayTrigger, Popover } from "react-bootstrap"
import { BsQuestionCircleFill } from "react-icons/bs"

const askTable = (
    <div>
        <b>For indicators where an increase in the value means improvement over time</b>
        <p>
            An area presenting the smallest increase (or a decrease in value) over time of the selected indicator is classified as being <i>the least performing</i>. An area presenting the highest increase over time of the selected indicator is classified as being <i>the highest performing</i>.
        </p>

        <b>For indicators where a decrease in the value means improvement over time</b>
        <p>
            An area presenting the highest decrease over time of the selected indicator is classified as being <i>the highest performing</i>. An area presenting the smallest decrease over time of the selected indicator (or an increase in value) is classified as being <i>the least performing</i>.
        </p>
    </div>
)

const askColorBar = (
    <div>
        <p>
            Irrespective of the direction of each indicator, the legend displays a better condition (improvement over time when looking at time change) in blue, and a worse condition (worsening over time when looking at time change) in red. For example, 
            <ul>
                <li> increasing value meaning better condition like % of contraceptive prevalence </li>
                <li> increasing value meaning worse condition like % of low birth weight </li>
            </ul>
        </p>
    </div>
)

const askChangeN = (
    <div>
        <p>
            The values shown on the map are our "best guess" given the data and modelling but as with any statistics there are a range of plausible values.
        </p>
        <p>
            The slider allows the user to choose the probability that there is meaningful improvement/worsening. The map filters out units where it is unlikely that there have been meaningful improvements.
        </p>

        <b>Technical:</b>
        <p>
            The <i>exceedance probability</i> is the probability, given the observed data, that the true change in a district is negative for improvement or positive for worsening.
        </p>
        <p>
            We use that to filter which districts to show on the map. Districts where the exceedance probability is less than the limit, set by the user on the slider, will be filtered out.
        </p>
        <hr/>
        Find out more on the <a href='./tech-note' target='_blank'>Tech Note</a> page.
    </div>
)

const askChangeP = (
    <div>
        <p>
            The values shown on the map are our "best guess" given the data and modelling but as with any statistics there are a range of plausible values.
        </p>
        <p>
            The slider allows the user to choose the probability that there is meaningful improvement/worsening. The map filters out units where it is unlikely that there have been meaningful improvements.
        </p>

        <b>Technical:</b>
        <p>
            The <i>exceedance probability</i> is the probability, given the observed data, that the true change in a district is positive for improvement or negative for worsening.
        </p>
        <p>
            We use that to filter which districts to show on the map. Districts where the exceedance probability is less than the limit, set by the user on the slider, will be filtered out.
        </p>
        <hr/>
        Find out more on <a href='./tech-note' target='_blank'>the Tech Note page</a>
    </div>
)

export function Ask({ about, positive=true}){
    const askAbout = {
        'How to read table': askTable,
        'About this color bar': askColorBar,
        'NNote on the change certainty': askChangeN,
        'Note on the change certainty': askChangeP
    }
    const content = positive ? askAbout[about] : askAbout['N'+about]

    const overlay = (
        <Popover>
            <Popover.Header>{about}</Popover.Header>
            <Popover.Body>{content}</Popover.Body>
        </Popover>
    )

    return (
        <OverlayTrigger trigger={'click'} placement='bottom-start' overlay={overlay}>
        <span className='mx-1' title={about}><BsQuestionCircleFill/></span>
        </OverlayTrigger>
    )
}