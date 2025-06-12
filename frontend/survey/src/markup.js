export const surveyMarkup = `
    <div class="survey-container">
        <div class="survey-header">
            <h1>My Real Evaluation – Free Home Estimate Survey</h1>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">Getting Started</div>
        </div>

        <form class="survey-form" id="surveyForm">
            <!-- Question 1 -->
            <div class="question-group" id="q1">
                <label class="question-label">What is your ZIP code? <span class="required">*</span></label>
                <input
                    type="text"
                    name="zipcode"
                    required
                    placeholder="Enter ZIP code"
                    inputmode="numeric"
                    maxlength="10"
                >
            </div>

            <!-- Question 2 -->
            <div class="question-group hidden" id="q2">
                <label class="question-label">What type of home is it?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="single-family">
                        Single-family home
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="condo">
                        Condo or apartment
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="townhouse">
                        Townhouse
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="duplex">
                        Duplex / Multi-unit
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="other">
                        Other
                    </label>
                </div>
            </div>

            <!-- Question 3 -->
            <div class="question-group hidden" id="q3">
                <label class="question-label">How many bedrooms?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="bedrooms" value="1">
                        1
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bedrooms" value="2">
                        2
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bedrooms" value="3">
                        3
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bedrooms" value="4">
                        4
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bedrooms" value="5+">
                        5+
                    </label>
                </div>
            </div>

            <!-- Question 4 -->
            <div class="question-group hidden" id="q4">
                <label class="question-label">How many bathrooms?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="1">
                        1
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="1.5">
                        1.5
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="2">
                        2
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="2.5">
                        2.5
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="3+">
                        3+
                    </label>
                </div>
            </div>

            <!-- Question 5 -->
            <div class="question-group hidden" id="q5">
                <label class="question-label">What is the approximate square footage?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="under-1000">
                        Under 1,000 sq ft
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="1000-1499">
                        1,000–1,499 sq ft
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="1500-1999">
                        1,500–1,999 sq ft
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="2000-2499">
                        2,000–2,499 sq ft
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="2500+">
                        2,500+ sq ft
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="not-sure">
                        Not sure
                    </label>
                </div>
            </div>

            <!-- Question 6 -->
            <div class="question-group hidden" id="q6">
                <label class="question-label">When was the home built?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="yearBuilt" value="before-1970">
                        Before 1970
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="yearBuilt" value="1970-1990">
                        1970–1990
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="yearBuilt" value="1990-2010">
                        1990–2010
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="yearBuilt" value="after-2010">
                        After 2010
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="yearBuilt" value="not-sure">
                        Not sure
                    </label>
                </div>
            </div>

            <!-- Question 7 -->
            <div class="question-group hidden" id="q7">
                <label class="question-label">What is the current occupancy status?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="occupancy" value="i-live">
                        I live in the property
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="occupancy" value="rented">
                        It is rented out
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="occupancy" value="vacant">
                        It is currently vacant
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="occupancy" value="other">
                        Other
                    </label>
                </div>
            </div>

            <!-- Question 8 -->
            <div class="question-group hidden" id="q8">
                <div class="section-header">Property Intent & Next Steps</div>
                <label class="question-label">Do you see yourself selling this house in the foreseeable future?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="changes" value="yes">
                        Yes
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="changes" value="maybe">
                        Maybe
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="changes" value="no">
                        No
                    </label>
                </div>
            </div>

            <!-- Question 9 -->
            <div class="question-group hidden" id="q9">
                <label class="question-label">If so, what is your estimated timeframe for making a decision?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="immediate">
                        Immediately
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="within-3-months">
                        Within 3 months
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="6-months">
                        6 months
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="year-plus">
                        One year or more
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="not-sure">
                        Not sure yet
                    </label>
                </div>
            </div>

            <!-- Question 10 -->
            <div class="question-group hidden" id="q10">
                <label class="question-label">Have you already spoken with a real estate professional about this property?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="professional" value="yes">
                        Yes
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="professional" value="no">
                        No
                    </label>
                </div>
            </div>

            <!-- Question 11 -->
            <div class="question-group hidden" id="q11">
                <label class="question-label">Would you be open to speaking with a trusted local expert for a more detailed home evaluation?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="expert" value="yes">
                        Yes
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="expert" value="no">
                        No
                    </label>
                </div>
            </div>

            <!-- Contact Section -->
            <div class="question-group hidden" id="contactInfo">
                <div class="section-header">Contact Information</div>
                <p style="margin-bottom: 20px; color: #666; font-size: 1.1rem;">Please provide your details so we can send your free estimate:</p>
                <div class="contact-fields">
                    <div class="contact-field">
                        <label>Full Name <span class="required">*</span></label>
                        <input type="text" name="fullName" required placeholder="Enter your full name">
                    </div>
                    <div class="contact-field">
                        <label>Street Address <span class="required">*</span></label>
                        <input type="text" name="address" required placeholder="123 Main St">
                    </div>
                    <div class="contact-field">
                        <label>Phone Number <span class="required">*</span></label>
                        <input
                            type="text"
                            name="phone"
                            required
                            placeholder="(555) 123-4567"
                            inputmode="tel"
                            maxlength="14"
                        >
                    </div>
                    <div class="contact-field">
                        <label>Email Address (optional)</label>
                        <input type="text" name="email" placeholder="your.email@example.com">
                    </div>
                </div>
                <div class="consent-field">
                    <label style="display:flex;align-items:flex-start;gap:8px;">
                        <input type="checkbox" name="consent" required style="margin-top:4px;">
                        <span>I agree to receive marketing text messages from My Real Evaluation at the number I provided. These may be sent using automated technology, and my consent is not required to make a purchase. Message &amp; data rates may apply. I can opt out at any time by replying STOP.</span>
                    </label>
                </div>
            </div>

            <div class="navigation-buttons">
                <button type="button" class="nav-btn next-btn" id="nextBtn">Next</button>
                <button type="submit" class="nav-btn submit-btn" id="submitBtn" style="display: none;">Get My Free Estimate</button>
                <button type="button" class="nav-btn prev-btn" id="prevBtn" disabled>Previous</button>
            </div>

            <div id="successMessage" class="success-message" style="display: none;"></div>
        </form>
    </div>
`;
