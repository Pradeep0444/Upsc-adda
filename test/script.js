document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Get elements
  const selectButtons = document.querySelectorAll(".select-button");
  const testSection = document.querySelector("#test-section");
  const subjectContainer = document.querySelector("#subject-container");
  const startBtn = document.querySelector("#start-button");
  const navBtn = document.querySelector(".navigation-buttons");
  const nextBtn = document.querySelector("#next-button");
  const prevBtn = document.querySelector("#prev-button");
  const submit = document.querySelector("#submit-button");
  const resultCard = document.querySelector("#result-card");
  const questionCardsContainer = document.querySelector("#question-cards");
  const backBtn = document.querySelector("#back-to-subjects");
  const timerElement = document.querySelector("#timer");
  const timeDisplay = document.querySelector("#time-display");


  // Initialize variables
  let questionElements = [];
  let questionIds = [];
  let answers = [];
  let randomQuestionsArray = [];
  let shownQuestions = [];
  let userAnswers = {};
  let currentQuestionIndex = -1;
  let numQuestionsToShow = 0;
  let subjectFile = "";
  let timerInterval;
  let secondsElapsed = 0;
  let historyStack = [];

  // Show the question
  function showQuestion(index) {
    if (index < 0 || index >= randomQuestionsArray.length) return;

    const questionId = randomQuestionsArray[index];
    const questionElement = document.getElementById(questionId);
    if (questionElement) {
      hideAllQuestions();
      questionElement.style.display = "block";
    }

    currentQuestionIndex = index;
    updateNavButtons();
  }

  // Hide all questions
  function hideAllQuestions() {
    const questionCards = document.querySelectorAll(".question");
    questionCards.forEach((card) => (card.style.display = "none"));
  }

  // Update navigation buttons
  function updateNavButtons() {
    prevBtn.disabled = currentQuestionIndex <= 0;
    nextBtn.disabled = currentQuestionIndex === randomQuestionsArray.length - 1;
  }

  // Generate new random questions
  function generateNewQuestionsArray(numQuestions) {
    randomQuestionsArray = [];
    shownQuestions = [];

    while (
      shownQuestions.length < numQuestions &&
      shownQuestions.length < questionIds.length
    ) {
      let currIndex;
      do {
        currIndex = Math.floor(Math.random() * questionIds.length);
      } while (shownQuestions.includes(currIndex));

      shownQuestions.push(currIndex);
      randomQuestionsArray.push(questionIds[currIndex]);
    }
  }

  // Fetch questions from file
  async function fetchQuestionsFromFile(fileName) {
    try {
      console.log("Fetching questions from:", fileName);
      const response = await fetch(fileName);
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, "text/html");
      questionElements = doc.querySelectorAll(".question");

      console.log("Fetched " + questionElements.length + " questions");

      // Clear previous questions
      questionCardsContainer.innerHTML = "";

      // Append questions to the document
      questionElements.forEach((element) => {
        questionCardsContainer.appendChild(element.cloneNode(true));
      });

      // Collect question IDs and answers
      questionIds = [];
      answers = [];
      questionElements.forEach((element) => {
        questionIds.push(element.id);
        answers.push(element.getAttribute("data-answer"));
      });

      generateNewQuestionsArray(numQuestionsToShow);
      showQuestion(0);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  // Start the timer
  function startTimer() {
    timerElement.style.display = "block";
    secondsElapsed = 0;
    timerInterval = setInterval(() => {
      secondsElapsed++;
      const minutes = Math.floor(secondsElapsed / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (secondsElapsed % 60).toString().padStart(2, "0");
      timeDisplay.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  // Stop the timer
  function stopTimer() {
    clearInterval(timerInterval);
    timerElement.style.display = "none";
  }

  // Show report card
  function showReportCard() {
    startBtn.style.display = "none";
    navBtn.style.display = "none";
    hideAllQuestions();
    resultCard.style.display = "flex";
    stopTimer();

    let totalCorrect = 0;
    let totalAttempted = 0;
    questionIds.forEach((questionId, i) => {
      const userAnswer = userAnswers[questionId];
      const correctAnswer = answers[i];
      if (userAnswer) {
        totalAttempted++;
        if (userAnswer === correctAnswer) {
          totalCorrect++;
        }
      }
    });

    // Clear previous content in the result card
    resultCard.innerHTML = "";

    // Display the total correct answers
    const marks = document.createElement("h2");
    marks.id = "result-marks";
    marks.textContent = `You got ${totalCorrect} out of ${numQuestionsToShow} correct answers.`;
    resultCard.appendChild(marks);

    // Display the number of attempted questions
    const attempts = document.createElement("p");
    attempts.id = "result-attempts";
    attempts.textContent = `You attempted ${totalAttempted} questions.`;
    resultCard.appendChild(attempts);

    // Display the total time spent
    const timeSpent = document.createElement("p");
    timeSpent.id = "result-time";
    timeSpent.textContent = `Time spent: ${timeDisplay.textContent}`;
    resultCard.appendChild(timeSpent);
  }

  // Start the test
  function letStart(numQuestions) {
    numQuestionsToShow = numQuestions;
    historyStack.push({ view: "test", subjectFile: subjectFile });
    startBtn.style.display = "none";
    testSection.style.display = "none";
    navBtn.style.display = "flex";
    fetchQuestionsFromFile(subjectFile);
    questionCardsContainer.style.display = "block";
    startTimer();
  }

  // Show the next question
  function showRandomQuestion() {
    if (randomQuestionsArray.length === 0) {
      generateNewQuestionsArray(numQuestionsToShow);
      if (randomQuestionsArray.length === 0) return;
      showQuestion(0);
    } else if (currentQuestionIndex < randomQuestionsArray.length - 1) {
      showQuestion(currentQuestionIndex + 1);
    } else {
      console.log("Current array is exhausted, generating new questions.");
      generateNewQuestionsArray(numQuestionsToShow);
      showQuestion(0);
    }
  }

  // Show previous question
  function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
      showQuestion(currentQuestionIndex - 1);
    }
  }

  // Capture user's answer
  function captureAnswer(questionId, userAnswer) {
    userAnswers[questionId] = userAnswer;
  }

  // Event listeners
  document.addEventListener("change", (event) => {
    if (event.target.type === "radio") {
      const questionId = event.target.name;
      const userAnswer = event.target.value;
      captureAnswer(questionId, userAnswer);
    }
  });

  prevBtn.addEventListener("click", showPreviousQuestion);
  startBtn.addEventListener("click", () => letStart(10));
  nextBtn.addEventListener("click", showRandomQuestion);
  submit.addEventListener("click", showReportCard);

  // Handle subject card clicks
  selectButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const subject = event.target.getAttribute("data-subject");

      const subjectFiles = {
        polity: "polity-questions.html",
        history: "history-questions.html",
        geography: "geography-questions.html",
        environment: "environment-questions.html",
        science: "science-questions.html",
        economy: "economy-questions.html",
        international: "international-questions.html",
        art: "art-questions.html",
        csat: "csat-questions.html",
      };

      subjectFile = subjectFiles[subject] || "";

      backBtn.style.display = "block";
      historyStack.push({ view: "test-options" });
      subjectContainer.style.display = "none";
      testSection.style.display = "block";
    });
  });

  // Add event listeners for new buttons
  document.querySelector("#ten").addEventListener("click", () => letStart(10));
  document
    .querySelector("#twenty")
    .addEventListener("click", () => letStart(20));
  document
    .querySelector("#fifty")
    .addEventListener("click", () => letStart(50));
  document
    .querySelector("#hundred")
    .addEventListener("click", () => letStart(100));

  backBtn.addEventListener("click", () => {
    console.log("History Stack Before Pop:", historyStack);
    stopTimer();
    const lastState = historyStack.pop();
    if (lastState) {
      console.log("Popped State:", lastState);
      switch (lastState.view) {
        case "test":
          subjectContainer.style.display = "none";
          testSection.style.display = "block";
          questionCardsContainer.style.display = "none";
          navBtn.style.display = "none";
          resultCard.style.display = "none";
          const marksElement = document.getElementById("result-marks");
          if (marksElement) {
            resultCard.removeChild(marksElement);
          }
          break;

        case "test-options":
          subjectContainer.style.display = "flex";
          testSection.style.display = "none";
          questionCardsContainer.innerHTML = "";
          resultCard.style.display = "none";
          startBtn.style.display = "none";
          navBtn.style.display = "none";
          backBtn.style.display = "none";
          stopTimer();
          break;

        case "result":
          subjectContainer.style.display = "none";
          testSection.style.display = "none";
          questionCardsContainer.style.display = "block";
          navBtn.style.display = "flex";
          resultCard.style.display = "none";
          break;

        default:
          console.log("Unknown view state");
          break;
      }
    } else {
      console.log("No state in historyStack");
    }
  });
});
