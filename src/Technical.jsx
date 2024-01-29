import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from 'react-bootstrap'
import exceedance from './assets/exceedance.png'

export default function Technical({which}) {
    if (which === 'boundary') {
        return (<FirstNote/>)
    } else {
        return (<SecondNote/>)
    }
}

function Figure ({src, label, number, caption}){
    return (
        <figure id={label}>
            <div className="blockquote text-center">
                <img alt={label} src={src} width='80%'/>
            </div>
            <figcaption className="blockquote-footer text-center">
                <b>Figure {number}.</b> {caption}
            </figcaption>
        </figure>
    )
}
function FirstNote() {
    return (
      <div className='bg-light rounded-4 p-3'>
        <h2>Technical Note 1</h2>
        <h3>
            Managing Over Time Changing Boundaries
        </h3>
        <hr/>
        <h4>Background</h4>
        <p>
            The India NFHS surveys are constructed to be representative at national, province and district level for most of the indicators. In the case of rare events indicators such as stillbirth rates, or where more sophisticated estimation methods were needed such as mortality rates (child and neonatal mortality rates), indicators were constructed and mapped at district level using the surveys. Specifically, for four indicators named, unsafe abortion, neonatal mortality rate, child mortality rate and stillbirth rate we used a two-step approach: <b>Step 1</b>. We followed the methods described in <a href='#reference'>Subramaniam et al. (2021)</a> and <a href='#reference'>Ulahannan et al. (2022)</a> to match the 2015-16 NFHS-4 data to 2019-21 NFHS-5 boundaries (ICF. The Demographic and Health Surveys Program Spatial Data Repository), in order to be able to compare changing districts over time; <b>Step 2</b>. Once all data were available at NFHS-5 boundaries, we rasterised the data for the whole country and then aggregated the data using the district level official boundaries of India (Ministry of Science and Technology, Government of India), which were used for final display on the online portal. Average values for districts were used for aggregation.
        </p>
        <p>
            For child worker, census estimates were used to calculate the indicator, and only had one point in time was available. Since census boundaries aligned with NFHS-4 boundaries, the same two-step approached as described above was applied.
        </p>
        <p>
            While the surveys were designed to be representative at the district level, caution is advised in interpreting and utilizing the findings due to the inherent limitations posed by small sample sizes for the mentioned indicators
        </p>
        <p>
            Furthermore, it is important to note that the indicators discussed herein are rare events, further emphasizing the need for careful consideration and caution in their interpretation, given the limited sample sizes at the district level.
        </p>

        <h5>Step 1. Harmonising boundaries from round 1 (NFHS-4) to round 2 (NFHS-5) to match round 2 (NFHS-5)</h5>
        <p>
            The administrative boundaries of India for the year 2015-2016 (NFHS-4) count a total of 640 districts while the administrative boundaries of India for the year 2019-2021 (NFHS-5) count a total of 707 districts (67 additional districts) (ICF. The Demographic and Health Surveys Program Spatial Data Repository). However, there are 36 states in both years with changes. The boundary changes begin with the addition of new states and the removal of some states, for example, at the state level, a new state Ladakh was created in 2019-2021 from Jammu and Kashmir, as shown in Figure 1 below.
        </p>

        <Figure src={''} label='dissagregation' number='1' 
            caption={'States dissagregation example'}/>
        
        <p>
            Meanwhile, Dadra and Nagar Haveli and Daman and Diu, two distinct states have now merged to form a new state called Dadra & Nagar Haveli & Daman & Diu as shown below in Figure 2.
        </p>

        <Figure src={''} label='aggregation' number='2' 
            caption={'States agregation example'}/>

        <p>
            For the additional 67 districts, data from NFHS-4 are not available therefore, to be able to compare changes in indicators aggregated at the district level, we applied a simple methodology to harmonize geographical boundaries across the two time periods and assign the corresponding indicator value following <a href='#reference'>Subramaniam et al. (2021)</a> and <a href='#reference'>Ulahannan et al. (2022)</a>. The methodology that we applied involves re-assigning indicators' values calculated from NFHS-4 data to all the 2019-21 NFHS-5 districts. This approach therefore does not make any alterations to the 2019-21 NFHS-5 data that are reported at the district level.
        </p>

        <p>
            The newly created 67 districts were formed from one or more districts included in the NFHS-4 dataset and can be divided into two different categories: type 1 and type 2. Type 1 districts (55 districts) were formed by altering the boundaries of one single district from 2015-16 NFHS-4 administrative boundaries and creating one new district. In comparison, type 2 districts (12 districts) were formed by adding geographical units from two or more parent districts. For the type 1 districts formed from one single parent district we assigned the same indicator's value as the parent district (Figure 3 and table 1)
        </p>

        <Figure src={''} label='type1' number='3' 
            caption={'Example of type 1 districts (Assam State)'}/>

        <p>
            In the example above the type 1 districts Biswanath and Hojai were formed from the parent district Sonitpur and Nagaon, respectively. For example, to calculate the NFHS-5 Unsafe abortion values, the new district (Biswanath) takes the same value for its parent district (Sonitpur). The same is applicable to the 95% Lower and Upper Confidence Intervals (CI) as shown in the table below:
        </p>

        <p>
            For type 2 districts, which were formed by adding areas from two or more parent districts, we assigned the average indicator’s value of the respective parent district (Figure 4 and Table 2).
        </p>

        <Figure src={''} label='type2' number='4' 
            caption={'Example of type 2 districts (Assam State)'}/>

        <p>
            Out of 36 states, 22 states have neither type 1 nor type 2 boundaries, these states are listed below with their numbers of unchanging district boundaries, that is, same number of boundaries in 2015-16 and 2019-21 (Table 3).
        </p>

        <p>
            These constitute 307 out of 707 districts that have not changed boundaries to either type 1 or type 2. The remaining 400 districts fall within 14 states, and all have type 1 districts, the only states without type 2 district boundaries are Assam, Chhattisgarh, Haryana, Madhya Pradesh, Maharashtra, Meghalaya, Punjab, Tripura, and West Bengal states.
        </p>
        <p>
            The following are the number of type 1 and type 2 districts with the total districts in each respective year, stating the number of new districts created in each state (Table 4).
        </p>

        <Accordion className='mb-3'>
            <AccordionItem>
                <AccordionHeader>
                    Changes on the listed states.
                </AccordionHeader>
                <AccordionBody>
                    Bla.. bla.. bla..
                </AccordionBody>
            </AccordionItem>
        </Accordion>

        <h5>Step 2. Rasterization and harmonisation to national official boundaries to enable over time comparisons</h5>

        <p>
            With indicator values for the 707 NFHS-5 districts in table format, these are joined to the NFHS-5 district boundary shapefile using a common attribute (State_District). For each indicator and confidence intervals within the joined table, the shapefile is rasterized, to match the raster properties (coordinate system, cell size and grid alignment) derived from a common mastergrid of the national boundaries (<a href='#reference'>WorldPop et al, 2018</a>). The rasterized indicator values are then summarized using the district level official boundaries of India (Ministry of Science and Technology, Government of India) by using a GIS tool that calculates the zonal statistics using R (2021) software. This produces statistics (mean and median) from all the raster cells that sit within each district boundary so that indicator values are generated for each of the 742 districts. Medians were used to summarise the indicators of interest. This outputted table can be exported as a csv file or shapefile. A flowchart of the steps can be found in Figure 5.
        </p>
        <Figure src={''} label='flowchart' number='5' 
            caption={'Flowchart illustrating the process of convering indicator values from NFHS-5 district boundaries to official distric boundaries'}/>

        <div id='reference'>
        <h4>Reference</h4>
        <ul>
            <li id='subramaniam2021'>Subramaniam SV, Kumar A, Tripathi N. Geographic insights lab. NFHS policy Tracker for districts. Cambridge, USA: Harvard Center for Population and Development Studies and Center for Geographic Analysis at Harvard, 2021.</li>
            <li id='ulahannan2022'><a href='https://gh.bmj.com/content/7/4/e007798.abstract' target='_blank'>Ulahannan, Sabu Kochupurackal, et al. "Alarming level of severe acute malnutrition in Indian districts.” BMJ global health 7.4 (2022): e007798.</a></li>
            <li id='worldpop2018'><a href='https://hub.worldpop.org/geodata/summary?id=29691' target='_blank'>WorldPop (www.worldpop.org - School of Geography and Environmental Science, University of Southampton; Department of Geography and Geosciences, University of Louisville; Departement de Geographie, Universite de Namur) and Center for International Earth Science Information Network (CIESIN), Columbia University (2018). Global High Resolution Population Denominators Project - Funded by The Bill and Melinda Gates Foundation (OPP1134076). https://hub.worldpop.org/geodata/summary?id=29691 . [Accessed 09 January 2023].</a></li>
            <li id='rcoreteam2021'><a href='https://R-project.org' target='_blank'>R Core Team (2021). R: A language and environment for statistical. computing. R Foundation for Statistical Computing, Vienna, Austria</a></li>
        </ul>
        </div>
        <br/>
        <hr/>
        <h4>.</h4>
      </div>
    );
}

function SecondNote() {
    return (
      <div className='bg-light rounded-4 p-3'>
        <h2>Technical Note 2</h2>
        <h3>Exceedance Probability and Confidence in Changes Over Time</h3>
        <hr/>
        <h4>Background</h4>
        <p>
            We have produced 5x5km high-resolution (also referred to as grid level) prediction and uncertainty maps illustrating changes over time for health and development indicators within specific subnational areas, such as districts or similar administrative divisions varying by country. Our methodology relies on data from the two most recent rounds of the nationally representative Demographic and Health Surveys (DHS), which are available at the cluster level, and mapped through GPS coordinates of the cluster centres. In the case of India, we utilised the National Family Health Surveys (NFHS), specifically NFHS-4 (2015-16) denoted as Round 1, and NFHS-5 (2019-22) denoted as Round 2. Measuring changes between these survey rounds allows us to track and assess the progress of the health and development indicators over time.
        </p>
        <p>
            To ensure the reliability of our estimates of the changes within each subnational area, we employed exceedance probability to quantify our confidence in these observed changes. Exceedance probability, commonly applied in environmental and risk analysis <a hfer='#reference'>Richards et al., 2014</a>, assesses the likelihood of an event surpassing a specific limit within a defined period (<a href='#reference'>Soch, 2020</a>). In simpler terms, exceedance probability helps us assess potential improvements or worsening of our health and development indicators. We express this likelihood as a percentage, indicating the probability of an indicator exceeding our defined threshold. For this work, we use the statistical significance levels of 90% (likely), 95% (highly likely), and 99% (almost certain). 
        </p>

        <h4>Outline</h4>
        <p>
            We outline the entire process of implementing and applying exceedance probability using the indicator "Percentage of women who had 4 or more antenatal visits" (ANC4+) in India as an example. For India, the subnational areas are the districts. This outline unfolds in three main steps: (1) preparation, (2) implementation, and (3) application. Further detail can be found in the Methods section. 
        </p>
        <div className="border border-secondary rounded-4 p-3 mb-4">
        <h5>Preparation</h5>
        <ol>
            <li>
                Sample grid-level estimates from the posterior distributions of the models. These models, processed through the Integrated Nested Laplace Approximation – Stochastic Partial Differential Equation method (INLA-SPDE) (<a href='#reference'>Rue et al., 2009</a>; <a href='#reference'>Lindgren et al., 2011</a>; <a href='#reference'>Martins et al., 2013</a>), pertain to the two rounds of survey data for ANC4+. 
            </li>
            <li>
                Derive grid-level change estimate samples by calculating the difference between the grid-level estimate samples of Round 2 and Round 1. 
            </li>
            <li>
                Aggregate the grid level change estimate samples to the subnational level, specifically at the district level, to obtain district level change estimate samples (see <a href='#fig-exceedance'>Figure 1a</a>). 
            </li>
        </ol>

        <h5>Implementation</h5>
        <ol>
            <li>
                The district level change estimate samples can be depicted using an empirical cumulative density function (ECDF) (<a href='#dekking2005'>Dekking et al., 2005</a>). The ECDF offers insights into the probability, given the data, that the true change is equal to or less than a specified value. It derives from the proportion of samples that are equal to or less than the specified value. For change in ANC4+, we are interested in the district estimate value zero, because we want to observe where there have been meaningful improvements for ANC4+.  
            </li>
            <li>
                The ECDF at zero for each district indicates the proportion of samples equal to or less than zero. This informs us of the probability, given the data, that the true change is less than or equal to zero. 
            </li>
            <li>
                The complement of the ECDF at zero, calculated as 1 – ECDF(0), tells us the proportion of samples greater than zero. This provides the probability, given the data, that the true change is greater than zero (see <a href='#fig-exceedance'>Figure 1b</a>). 
            </li>
        </ol>

        <h5>Application</h5>
        <ol>
            <li>
                To ensure a high level of certainty (95% certain) that district level estimates are greater than zero, compare the probability (or proportion) obtained with 95% (or 0.95). Adjust the slider in the Portal to highlight districts where improvements are highly certain (95% certain). 
            </li>
            <li>
                Conversely, if the probability (or proportion) is below 95% (less than 0.95), it indicates a lack of high certainty (95% certain) regarding meaningful improvements in those districts. 
            </li>
            <li>
                Steps 1 and 2 can be repeated for various certainty levels (see <a href='#fig-exceedance'>Figure 1c</a>).
            </li>
        </ol>

        <figure id='fig-exceedance'>
            <div className="blockquote text-center">
                <img alt='exceedance' src={exceedance} width='80%'/>
            </div>
            <figcaption className="blockquote-footer text-center">
                <b>Figure 1.</b> Workflow highlighting some of the key steps of the process described in the Outline for implementing and applying exceedance probability using the indicator ANC4+ in selected districts in India. Panel (a) links to Step 1.3 in the Outline and shows the samples of district level estimates for the change over time between NFHS-4 (Round 1) and NFHS-5 (Round2) for the ANC4+ indicator in the state of Odisha, India. Panel (b) links to Step 2.3 in the Outline and shows the histograms and proportions of samples for estimates of change over time in two districts within the state of Odisha, India. Panel (c) links to Step 3 in the Outline and is a visual representation of how changing significance levels affect the confidence (uncertainty) around the estimated improvement of ANC4+ over time for the selected districts. 
            </figcaption>
        </figure>

        </div>

        <h4>Methods</h4>
        <p>
            In examining changes in ANC4, we employed the statistical method INLA-SPDE to estimate ANC4+ values. This method generates “best estimations” (posterior distributions) based on available data, enabling us to predict potential ANC4 values. By comparing these values across different survey rounds, we obtain samples representing changes at grid and district levels.
        </p>
        <p>
            To ensure reliability in these estimates, we utilised the ECDF. The ECDF visually represents the likelihood of observing specific changes in ANC4+. For example, the ECDF at zero indicates the likelihood of observing changes equal to or less than zero in ANC4+. Its complement, calculated as 1 minus the ECDF value at zero, informs us about the probability, given the data, of observing changes greater than zero (see <a href='#fig-exceedance'>Figure 1c</a>). We then apply this information by comparing probabilities from the ECDF at zero against a 95% threshold, illustrated in Figure 1d, to highlight districts where improvements are highly certain (95% certain).  
        </p>

        <h4>Conclusion</h4>
        <p>
            Our utilisation of exceedance probability establishes a robust framework for interpreting changes over time, offering critical insights into trends and the potential for achieving significant improvements within specified timeframes. For example, assessing the exceedance probability associated with the prevalence of stunting provides valuable insights into the reduction of stunting over time. This methodology empowers policymakers by providing a credible assessment of trends, enabling informed decisions for effective interventions. 
        </p>

        <div id='reference'>
        <h4>Reference</h4>
        <ul>
            <li id='dekking2005'><a href='https://link.springer.com/book/10.1007/1-84628-168-7' target='_blank'>Dekking, F. M., Kraaikamp, C., Lopuhaä, H. P., & Meester, L. E. (2005). A Modern Introduction to Probability and Statistics: Understanding why and how (Vol. 488). London: springer.</a></li>
            <li id='lindgren2011'><a href='https://doi.org/10.1111/j.1467-9868.2011.00777.x' target='_blank'>Lindgren, F., Rue, H., & Lindström, J. (2011). An explicit link between Gaussian fields and Gaussian Markov random fields: the stochastic partial differential equation approach. Journal of the Royal Statistical Society Series B: Statistical Methodology, 73(4), 423-498.</a></li>
            <li id='martins2013'><a href='https://doi.org/10.1016/j.csda.2013.04.014' target='_blank'>Martins, T. G., Simpson, D., Lindgren, F., & Rue, H. (2013). Bayesian computing with INLA: new features. Computational Statistics & Data Analysis, 67, 68-83.</a></li>
            <li id='richards2014'><a href='https://doi.org/10.1016/j.sste.2014.08.002' target='_blank'>Richards, K. K., Hazelton, M. L., Stevenson, M. A., Lockhart, C. Y., Pinto, J., & Nguyen, L. (2014). Using exceedance probabilities to detect anomalies in routinely recorded animal health data, with particular reference to foot-and-mouth disease in Viet Nam. Spatial and Spatio-Temporal Epidemiology, 11, 125-133.</a></li>
            <li id='rue2009'><a href='https://doi.org/10.1111/j.1467-9868.2008.00700.x' target='_blank'>Rue, H., Martino, S., & Chopin, N. (2009). Approximate Bayesian inference for latent Gaussian models by using integrated nested Laplace approximations. Journal of the Royal Statistical Society Series B: Statistical Methodology, 71(2), 319-392.</a></li>
            <li id='soch2020'><a href='https://statproofbook.github.io/D/prob-exc.html' target='_blank'>Soch, J. (2020). Definition: Exceedance probability. The Book of Statistical Proofs.</a></li>
        </ul>
        </div>
        <br/>
        <hr/>
        <h4>.</h4>
      </div>
    );
}