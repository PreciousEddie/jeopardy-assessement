let categories = [];
let currentQuestionIndex = 0;

async function getRandomCategories() {
  const numCategories = 100; // The maximum number of categories available in the jService API
  const randomPage = Math.floor(Math.random() * (numCategories / 100)) + 1;
  const response = await axios.get(
    `https://jservice.io/api/categories?count=100&offset=${randomPage * 100}`
  );
  const randomCategories = _.sampleSize(response.data, 6);
  return randomCategories;
}

async function getCategory(catId) {
  const response = await axios.get(
    `https://jservice.io/api/category?id=${catId}`
  );
  const { title, clues } = response.data;
  const clueArray = clues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return { title, clues: clueArray };
}

async function fillCard() {
  const randomCategories = await getRandomCategories();
  const categoryPromises = randomCategories.map((category) =>
    getCategory(category.id)
  );
  const categoriesData = await Promise.all(categoryPromises);
  categories = categoriesData;

  const jeopardyCard = $("#jeopardy");
  jeopardyCard.empty();

  const cardIndex = Math.floor(currentQuestionIndex / 2);
  const questionIndex = currentQuestionIndex % 2;

  if (cardIndex >= categories.length) {
    alert("Game Over. Please reload.");
    return;
  }

  const category = categories[cardIndex].title;
  const question = categories[cardIndex].clues[questionIndex].question;
  const answer = categories[cardIndex].clues[questionIndex].answer;

  const cardCategory = $("<h2></h2>").text(category);
  const cardQuestion = $("<p></p>").text(question).addClass("question");
  const cardAnswer = $("<p></p>").text(answer).addClass("answer").hide(); // Hide the answer initially

  jeopardyCard.append(cardCategory, cardQuestion, cardAnswer);
  jeopardyCard.show(); // Show the Jeopardy card

  jeopardyCard.on("click", function handleClick() {
    if (!cardAnswer.is(":visible")) {
      cardAnswer.show().addClass("reveal");
    } else {
      currentQuestionIndex++;

      jeopardyCard.empty();
      fillCard();
    }
  });

  $("#spin-container").hide();
}

function showLoadingView() {
  $("#spin-container").css("display", "block");
  $("#start").text("Loading...").prop("disabled", true);
}

function hideLoadingView() {
  $("#spin-container").css("display", "none");
  $("#start").text("Restart Game").prop("disabled", false);
}

async function setupAndStart() {
  showLoadingView();
  await fillCard();
  hideLoadingView();
}

$(document).ready(function () {
  $("#start").click(setupAndStart);
});
