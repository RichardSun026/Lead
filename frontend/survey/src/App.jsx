import { useEffect } from 'react';
import { surveyMarkup } from './markup';
import './App.css';

export default function App() {
  useEffect(() => {
    const form = document.getElementById('surveyForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    let currentStep = 1;
    let shouldRedirectToRealtor = false;
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
        next: (value) => {
          if (value === 'yes') shouldRedirectToRealtor = true;
          return 'contact';
        },
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

      const questionId = stepNumber === 'contact' ? 'contactInfo' : `q${stepNumber}`;
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
      const currentQuestionId = currentStep === 'contact' ? 'contactInfo' : `q${currentStep}`;
      const currentQuestion = document.getElementById(currentQuestionId);
      if (!currentQuestion) return null;

      const radioInput = currentQuestion.querySelector('input[type="radio"]:checked');
      if (radioInput) return radioInput.value;

      const textInput = currentQuestion.querySelector('input[type="text"]');
      if (textInput && textInput.required) return textInput.value.trim();

      return null;
    }

    function canProceed() {
      const currentQuestionId = currentStep === 'contact' ? 'contactInfo' : `q${currentStep}`;
      const currentQuestion = document.getElementById(currentQuestionId);
      if (!currentQuestion) return false;

      if (currentQuestionId === 'contactInfo') {
        const requiredFields = currentQuestion.querySelectorAll('input[required]');
        return Array.from(requiredFields).every((field) => field.value.trim() !== '');
      }

      const radioChecked = currentQuestion.querySelector('input[type="radio"]:checked');
      if (currentQuestion.querySelector('input[type="radio"]')) {
        return radioChecked !== null;
      }

      const textInput = currentQuestion.querySelector('input[type="text"][required]');
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

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!canProceed()) {
        alert('Please fill in all required fields.');
        return;
      }

      const successMessage = document.getElementById('successMessage');
      submitBtn.innerHTML = 'Processing...';
      submitBtn.disabled = true;

      setTimeout(() => {
        if (shouldRedirectToRealtor) {
          successMessage.innerHTML = `
                        <strong>Thank you!</strong> Redirecting you to speak with a trusted local expert...
                        <br><br>
                        <em>In a real application, you would be redirected to the realtor website now.</em>
                    `;
          successMessage.style.display = 'block';
        } else {
          successMessage.innerHTML = `
                        <strong>Thank you!</strong> An agent may contact you shortly to help provide a more accurate estimate based on your property.
                    `;
          successMessage.style.display = 'block';
        }

        submitBtn.innerHTML = 'Get My Free Estimate';
        submitBtn.disabled = false;
        document.querySelector('.navigation-buttons').style.display = 'none';
      }, 1500);
    });

    showQuestion(1);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: surveyMarkup }} />;
}
