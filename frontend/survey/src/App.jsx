import { useEffect } from 'react';
import { surveyMarkup } from './markup';
import './App.css';

export default function App() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const parts = url.pathname.split('/').filter(Boolean);
    const realtorUuid = parts[0] || '';

    const form = document.getElementById('surveyForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const zipInput = form.querySelector('input[name="zipcode"]');
    const phoneInput = form.querySelector('input[name="phone"]');

    const formatZip = (value) => {
      const digits = value.replace(/\D/g, '').slice(0, 9);
      if (digits.length <= 5) return digits;
      return digits.slice(0, 5) + '-' + digits.slice(5);
    };
    const formatPhone = (value) => {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      let out = '';
      if (digits.length > 0) out += '(' + digits.slice(0, 3);
      if (digits.length >= 4) out += ') ' + digits.slice(3, 6);
      if (digits.length >= 7) out += '-' + digits.slice(6, 10);
      return out;
    };
    if (zipInput) {
      zipInput.addEventListener('input', (e) => {
        e.target.value = formatZip(e.target.value);
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = formatPhone(e.target.value);
      });
    }

    let currentStep = 1;
    let stepHistory = [1];

    const questionFlow = {
      1: { next: 2 },
      2: { next: 3 },
      3: { next: 4 },
      4: { next: 5 },
      5: { next: 6 },
      6: { next: 7 },
      7: { next: 8 },
      8: {
        next: (value) => {
          if (value === 'no') return 'contact';
          return 9;
        },
      },
      9: {
        next: (value) => {
          if (value === 'immediate' || value === 'within-3-months') return 10;
          return 'contact';
        },
      },
      10: {
        next: (value) => {
          if (value === 'yes') return 'contact';
          return 11;
        },
      },
      11: {
        next: () => 'contact',
      },
    };

    function updateProgress() {
      const currentPosition = stepHistory.length;
      const estimatedTotal = 10;
      const progress = Math.min((currentPosition / estimatedTotal) * 100, 90);
      progressFill.style.width = progress + '%';

      if (currentStep === 'contact') {
        progressText.textContent = 'Almost Done!';
      } else {
        progressText.textContent = `Step ${currentPosition}`;
      }
    }

    function showQuestion(stepNumber) {
      document.querySelectorAll('.question-group').forEach((q) => {
        q.classList.add('hidden');
      });

      const questionId =
        stepNumber === 'contact' ? 'contactInfo' : `q${stepNumber}`;
      const currentQuestion = document.getElementById(questionId);
      if (currentQuestion) {
        currentQuestion.classList.remove('hidden');
        setTimeout(() => {
          currentQuestion.style.opacity = '1';
        }, 50);
      }

      prevBtn.disabled = stepHistory.length <= 1;

      if (stepNumber === 'contact') {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        progressFill.style.width = '100%';
        progressText.textContent = 'Final Step';
      } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
      }

      updateProgress();
    }

    function getCurrentStepValue() {
      const currentQuestionId =
        currentStep === 'contact' ? 'contactInfo' : `q${currentStep}`;
      const currentQuestion = document.getElementById(currentQuestionId);
      if (!currentQuestion) return null;

      const radioInput = currentQuestion.querySelector(
        'input[type="radio"]:checked',
      );
      if (radioInput) return radioInput.value;

      const textInput = currentQuestion.querySelector('input[type="text"]');
      if (textInput && textInput.required) return textInput.value.trim();

      return null;
    }

    function canProceed() {
      const currentQuestionId =
        currentStep === 'contact' ? 'contactInfo' : `q${currentStep}`;
      const currentQuestion = document.getElementById(currentQuestionId);
      if (!currentQuestion) return false;

      if (currentQuestionId === 'contactInfo') {
        const requiredFields =
          currentQuestion.querySelectorAll('input[required]');
        return Array.from(requiredFields).every(
          (field) => field.value.trim() !== '',
        );
      }

      const radioChecked = currentQuestion.querySelector(
        'input[type="radio"]:checked',
      );
      if (currentQuestion.querySelector('input[type="radio"]')) {
        return radioChecked !== null;
      }

      const textInput = currentQuestion.querySelector(
        'input[type="text"][required]',
      );
      if (textInput) {
        return textInput.value.trim() !== '';
      }

      return true;
    }

    function getNextStep() {
      const flowRule = questionFlow[currentStep];
      if (!flowRule) return currentStep + 1;

      if (typeof flowRule.next === 'function') {
        const currentValue = getCurrentStepValue();
        return flowRule.next(currentValue);
      }

      return flowRule.next;
    }

    nextBtn.addEventListener('click', () => {
      if (!canProceed()) {
        alert('Please answer the question before proceeding.');
        return;
      }

      const nextStep = getNextStep();
      currentStep = nextStep;
      stepHistory.push(currentStep);
      showQuestion(currentStep);
    });

    prevBtn.addEventListener('click', () => {
      if (stepHistory.length > 1) {
        stepHistory.pop();
        currentStep = stepHistory[stepHistory.length - 1];
        showQuestion(currentStep);
      }
    });

    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', function () {
        const groupName = this.name;
        document.querySelectorAll(`input[name="${groupName}"]`).forEach((r) => {
          r.closest('.radio-option').classList.remove('selected');
        });
        this.closest('.radio-option').classList.add('selected');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!canProceed()) {
        alert('Please fill in all required fields.');
        return;
      }

      submitBtn.innerHTML = 'Processing...';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const name = formData.get('fullName');
      const phone = formData.get('phone');
      const email = formData.get('email') || '';
      const zipcode = formData.get('zipcode') || '';
      const homeType = formData.get('homeType') || '';
      const bedrooms = formData.get('bedrooms') || '';
      const bathrooms = formData.get('bathrooms') || '';
      const sqft = formData.get('sqft') || '';
      const yearBuilt = formData.get('yearBuilt') || '';
      const occupancy = formData.get('occupancy') || '';
      const timeframe = formData.get('timeframe') || '';
      const professional = formData.get('professional') || '';
      const expert = formData.get('expert') || '';

      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            email,
            realtorUuid,
            zipcode,
            homeType,
            bedrooms,
            bathrooms,
            sqft,
            yearBuilt,
            occupancy,
            timeframe,
            professional,
            expert,
          }),
        });
      } catch (err) {
        console.error('Failed to create lead', err);
      }

      if (shouldRedirectToRealtor) {
        window.location.href = `${process.env.SITE_URL}/${realtorUuid}/${encodeURIComponent(phone)}`;
      } else {
        document.getElementById('successMessage').textContent =
          'Thank you! A realtor will contact you soon.';
        document.getElementById('successMessage').style.display = 'block';
        await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            time: new Date().toISOString(),
            phone,
            content:
              'Thanks for reaching out! A realtor will contact you soon.',
          }),
        });
        await fetch('/api/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message: 'New lead', followUp: true }),
        });
      }
    });

    showQuestion(1);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: surveyMarkup }} />;
}
