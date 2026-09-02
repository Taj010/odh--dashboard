/**
 * Shared click-to-reveal quiz. Each .quiz-options list needs data-answer="a|b|c|d"
 * and each <li> needs data-option matching that letter.
 */
(function () {
  document.querySelectorAll('.quiz-options').forEach(function (ul) {
    var answer = ul.dataset.answer;
    ul.querySelectorAll('li').forEach(function (li) {
      li.addEventListener('click', function () {
        ul.querySelectorAll('li').forEach(function (item) {
          item.classList.remove('correct', 'incorrect');
        });
        if (li.dataset.option === answer) {
          li.classList.add('correct');
        } else {
          li.classList.add('incorrect');
          var right = ul.querySelector('[data-option="' + answer + '"]');
          if (right) right.classList.add('correct');
        }
      });
    });
  });
})();
