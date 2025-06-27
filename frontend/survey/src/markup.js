export const surveyMarkup = `
    <div class="survey-container">
        <div class="survey-header">
            <h1>My Real Evaluation – Avaliação Gratuita do Imóvel</h1>
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">Iniciando</div>
        </div>

        <form class="survey-form" id="surveyForm">
            <!-- Question 1 -->
            <div class="question-group" id="q1">
                <label class="question-label">Qual é o seu CEP? <span class="required">*</span></label>
                <input
                    type="text"
                    name="zipcode"
                    required
                    placeholder="Digite o CEP"
                    inputmode="numeric"
                    maxlength="10"
                >
            </div>

            <!-- Question 2 -->
            <div class="question-group hidden" id="q2">
                <label class="question-label">Qual é o tipo de imóvel?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="single-family">
                        Casa
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="condo">
                        Condomínio ou apartamento
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="townhouse">
                        Sobrado
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="duplex">
                        Duplex / Multiunidades
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="homeType" value="other">
                        Outro
                    </label>
                </div>
            </div>

            <!-- Question 3 -->
            <div class="question-group hidden" id="q3">
                <label class="question-label">Quantos quartos?</label>
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
                <label class="question-label">Quantos banheiros?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="1">
                        1
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="1.5">
                        1,5
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="2">
                        2
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="2.5">
                        2,5
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="bathrooms" value="3+">
                        3+
                    </label>
                </div>
            </div>

            <!-- Question 5 -->
            <div class="question-group hidden" id="q5">
                <label class="question-label">Qual a metragem aproximada?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="under-50">
                        Menos de 50 m²
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="50-99">
                        50–99 m²
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="100-149">
                        100–149 m²
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="150-199">
                        150–199 m²
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="200+">
                        Acima de 200 m²
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="sqft" value="not-sure">
                        Não sei
                    </label>
                </div>
            </div>

            <!-- Question 6 -->
            <div class="question-group hidden" id="q6">
                <label class="question-label">Quando o imóvel foi construído?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="yearBuilt" value="before-1970">
                        Antes de 1970
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
                        Após 2010
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="yearBuilt" value="not-sure">
                        Não sei
                    </label>
                </div>
            </div>

            <!-- Question 7 -->
            <div class="question-group hidden" id="q7">
                <label class="question-label">Qual é a ocupação atual?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="occupancy" value="i-live">
                        Eu moro no imóvel
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="occupancy" value="rented">
                        Está alugado
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="occupancy" value="vacant">
                        Está desocupado
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="occupancy" value="other">
                        Outro
                    </label>
                </div>
            </div>

            <!-- Question 8 -->
            <div class="question-group hidden" id="q8">
                <div class="section-header">Intenção em relação ao imóvel e próximos passos</div>
                <label class="question-label">Você pretende vender este imóvel em um futuro próximo?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="changes" value="yes">
                        Sim
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="changes" value="maybe">
                        Talvez
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="changes" value="no">
                        Não
                    </label>
                </div>
            </div>

            <!-- Question 9 -->
            <div class="question-group hidden" id="q9">
                <label class="question-label">Se sim, qual é o prazo estimado para a decisão?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="immediate">
                        Imediatamente
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="within-3-months">
                        Dentro de 3 meses
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="6-months">
                        6 meses
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="year-plus">
                        Um ano ou mais
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="timeframe" value="not-sure">
                        Ainda não sei
                    </label>
                </div>
            </div>

            <!-- Question 10 -->
            <div class="question-group hidden" id="q10">
                <label class="question-label">Você já falou com um profissional imobiliário sobre este imóvel?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="professional" value="yes">
                        Sim
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="professional" value="no">
                        Não
                    </label>
                </div>
            </div>

            <!-- Question 11 -->
            <div class="question-group hidden" id="q11">
                <label class="question-label">Você gostaria de falar com um especialista local para uma avaliação mais detalhada do imóvel?</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="expert" value="yes">
                        Sim
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="expert" value="no">
                        Não
                    </label>
                </div>
            </div>

            <!-- Contact Section -->
            <div class="question-group hidden" id="contactInfo">
                <div class="section-header">Informações de Contato</div>
                <p style="margin-bottom: 20px; color: #666; font-size: 1.1rem;">Forneça seus dados para que possamos enviar sua avaliação gratuita:</p>
                <div class="contact-fields">
                    <div class="contact-field">
                        <label>Nome Completo <span class="required">*</span></label>
                        <input type="text" name="fullName" required placeholder="Digite seu nome completo">
                    </div>
                    <div class="contact-field">
                        <label>Telefone <span class="required">*</span></label>
                        <input
                            type="text"
                            name="phone"
                            required
                            placeholder="(11) 99999-9999"
                            inputmode="tel"
                            maxlength="14"
                        >
                    </div>
                    <div class="contact-field">
                        <label>Email (opcional)</label>
                        <input type="text" name="email" placeholder="seu.email@exemplo.com">
                    </div>
                </div>
                    <div class="consent-field">
                    <label style="display:flex;align-items:flex-start;gap:8px;">
                        <input type="checkbox" name="consent" required style="margin-top:4px;">
                        <span><span class="required">*</span>&nbsp;Concordo em receber mensagens de texto de marketing da My Real Evaluation no número fornecido. Elas podem ser enviadas por tecnologia automatizada e meu consentimento não é obrigatório para realizar uma compra. Tarifas de mensagem e dados podem ser aplicadas. Posso cancelar a qualquer momento respondendo PARAR.</span>
                    </label>
                </div>
            </div>

            <div class="navigation-buttons">
                <button type="button" class="nav-btn next-btn" id="nextBtn">Próximo</button>
                <button type="submit" class="nav-btn submit-btn" id="submitBtn" style="display: none;">Receber Avaliação Gratuita</button>
                <button type="button" class="nav-btn prev-btn" id="prevBtn" disabled>Anterior</button>
            </div>

            <div id="successMessage" class="success-message" style="display: none;"></div>
        </form>
    </div>
`;
