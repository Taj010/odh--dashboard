/**
 * Lightweight quiz widget for ODH Dashboard lessons.
 *
 * Usage: add class="quiz" to a container, with radio inputs
 * whose value matches the data-answer attribute on the container.
 * A .feedback element inside will be shown with correct/wrong class.
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.quiz').forEach(quiz => {
    const answer = quiz.dataset.answer;
    const feedback = quiz.querySelector('.feedback');
    if (!answer || !feedback) return;

    quiz.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const isCorrect = radio.value === answer;
        feedback.textContent = isCorrect
          ? '\u2705 Correct!'
          : `\u274C Not quite \u2014 ${quiz.dataset.hint || 'try again.'}`;
        feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
      });
    });
  });
});
