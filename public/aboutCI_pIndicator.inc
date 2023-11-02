<p>
    The slider allows the user to choose the probability that there is meaningful improvement/worsening. The map greys out areas where it is unlikely that there have been meaningful improvements.
</p>

<h5>Technical:</h5>
<p>
    The <i>exceedance probability</i> is the probability, given the observed data, that the true change in a district is positive for improvement or negative for worsening.
</p>
<p>
    We use that to filter which districts to show on the map. Districts where the exceedance probability is less than the limit, set by the user on the slider, will be greyed out.
</p>

<h5>Illustration:</h5>