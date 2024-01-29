import exceedance from './assets/exceedance.png'

export default function Technical() {
    return (
      <div className='bg-light rounded-4 p-3'>
        <h3>Exceedance Probability and Confidence in Changes Over Time</h3>
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