const stopWords = [
  "a",
  "an",
  "the",
  "is",
  "it",
  "of",
  "and",
  "to",
  "in",
  "with",
  "for",
  "on",
  "at",
  "by",
  "or",
  "that",
  "this",
  "can",
  "as",
  "be",
  "will",
  "are",
  "you",
  "i",
  "me",
  "my",
  "your",
  "his",
  "her",
  "its",
  "their",
  "ours",
  "ourselves",
  "them",
  "us",
];

const removeStopWords = (text: string): string => {
  const words = text.split(/\s+/);
  const filteredWords = words.filter((word) => !stopWords.includes(word));
  return filteredWords.join(" ");
};

export const handleChatbotMessage = (message: string): string => {
  const lowerMessage = message.toLowerCase().trim();
  const normalizedMessage = removeStopWords(lowerMessage);

  // Regex-based keyword matching on normalized message
  const regexMatch = (regex: RegExp): boolean => regex.test(normalizedMessage);

  let response = "";

  // Greeting Intent
  if (regexMatch(/^(hello|hi|selam|hey)$/)) {
    response = "Hello to you too!";
  } else if (
    regexMatch(
      /how was your day|how are you|how are you doing|what’s up|what is up/
    )
  ) {
    response =
      "I’m just a chatbot, so I don’t have days, but I’m here to help you! How can I assist you today?";

    // Account creation or login related
  } else if (
    regexMatch(
      /log me out | send me back to the login page| navigate problem search|navigate all request history|navigate completed page|navigate accepted page|navigate rejected page|navigate inprogress page/
    )
  ) {
    response = "";
  } else if (
    regexMatch(/how can i register|create account|new account|register|sign up/)
  ) {
    response =
      'You don’t need to create an account. Accounts are provided by the admin. Please sign in with your given username and password. If you forget your password, use the "Forgot Password" section.';
  } else if (regexMatch(/login|sign in|log in/)) {
    response =
      "You can log in with the account that has been created for you. After logging in, you can change your username and password.";
  } else if (
    regexMatch(
      /forgot password|recover password|reset password|password recovery/
    )
  ) {
    response =
      'To recover your password, go to the "Forgot Password" section, input your email, and we will send you a recovery password if your email is in our database.';
  } else if (regexMatch(/account creation|sign up process|register account/)) {
    response =
      "Accounts are managed by the admin. Please contact them if you need a new account or have questions about account creation.";

    // About the system
  } else if (
    regexMatch(
      /what do you do|what does this app do|tell me about this system|what is this app|what is this system/
    )
  ) {
    response =
      "This app is a Request Management System built to streamline maintenance requests for employees at the Ethiopian Artificial Intelligence Institute.";
  } else if (
    regexMatch(
      /how does this system work|what is the purpose of this app|how does this app function/
    )
  ) {
    response =
      "The system helps manage maintenance requests efficiently. Employees can submit requests, track their status, and provide feedback on completed tasks.";

    // Submitting and viewing requests
  } else if (
    regexMatch(/submit request|new request|create request|make request/)
  ) {
    response =
      'To submit a request, navigate to the "emp_dashboard" section and click on "+ New Request." You can then fill out the form and submit it.';
  } else if (
    regexMatch(
      /view request|request history|track request|check request status/
    )
  ) {
    response =
      'You can view your previous request history on the "emp_dashboard" section. Your requests are categorized as completed, accepted, in progress, or rejected.';
  } else if (
    regexMatch(
      /how can i check my requests|where can i view my requests|view past requests/
    )
  ) {
    response =
      'To check your past requests, go to the "emp_dashboard" section and look for the request history section.';

    // Request approval and process
  } else if (
    regexMatch(
      /approve request|request approval|approval process|how is a request approved/
    )
  ) {
    response =
      "Your request will be pre-processed by our app and sent to your department head for approval. If approved, a technician will be assigned to you.";
  } else if (
    regexMatch(/how long|request duration|how much time|processing time/)
  ) {
    response =
      "The time it takes to process your request depends on the urgency. If it’s marked as high urgency, it will be prioritized. Average resolution time is between 2 to 4 days.";
  } else if (
    regexMatch(/request processing time|how soon will my request be handled/)
  ) {
    response =
      "Requests are processed based on urgency and availability. High urgency requests are prioritized. You can expect an average resolution time of 2 to 4 days.";

    // Technician assignment and communication
  } else if (
    regexMatch(
      /assign technician|who will fix|maintenance assignment|who will handle my request/
    )
  ) {
    response =
      "Once your request is approved, the maintenance team head will assign a technician. The technician will contact you via email or phone.";
  } else if (
    regexMatch(
      /contact technician|communicate with technician|reach out to technician/
    )
  ) {
    response =
      "You don’t need to contact the technician directly. The technician will contact you via the details provided once they are assigned to your request.";
  } else if (
    regexMatch(/how do i reach the technician|can i contact the technician/)
  ) {
    response =
      "The technician will contact you directly once they are assigned to your request, so there is no need for you to reach out to them yourself.";

    // System features and feedback
  } else if (
    regexMatch(/feedback|rate technician|review service|provide feedback/)
  ) {
    response =
      "Once your request is completed, you can provide feedback by clicking on the completed request in your emp_dashboard section. You’ll be able to rate the technician and provide comments.";
  } else if (
    regexMatch(
      /how can i leave feedback|where do i rate the technician|feedback process/
    )
  ) {
    response =
      "To leave feedback, navigate to the completed request in your emp_dashboard and click on the feedback option to rate the technician and leave comments.";
  } else if (
    regexMatch(/update status|request status|how to update request status/)
  ) {
    response =
      "You don’t need to manually update the status. The system will automatically update it as your request progresses.";
  } else if (
    regexMatch(/status update|how do i see the status of my request/)
  ) {
    response =
      'The status of your request is updated automatically. You can check it in the "emp_dashboard" section where your requests are listed.';

    // Problem search feature
  } else if (
    regexMatch(
      /search problems|self troubleshoot|solve problem on my own|troubleshoot issues/
    )
  ) {
    response =
      "Yes, you can search for minor problems on the site by navigating to the problem search section. Enter your device type, issue, or model to get step-by-step guidance, including video tutorials.";
  } else if (
    regexMatch(/how to troubleshoot|find solutions for problems|self help/)
  ) {
    response =
      "You can use the problem search feature to find solutions and troubleshoot issues yourself. Look for the problem search section on the site for detailed guidance and tutorials.";

    // Availability and service
  } else if (
    regexMatch(
      /available|working hours|when can i make a request|service hours/
    )
  ) {
    response =
      "You can submit requests 24/7. However, the maintenance team may not be available on Sundays, though the system is always operational.";
  } else if (
    regexMatch(
      /when is the maintenance team available|service availability|working schedule/
    )
  ) {
    response =
      "Requests can be submitted at any time, but the maintenance team may not be available on Sundays. The system remains operational around the clock.";

    // Classified information response
  } else if (regexMatch(/classified|confidential|sensitive information/)) {
    response = "That information is classified.";
  } else if (
    regexMatch(/what is classified|can you provide classified information/)
  ) {
    response =
      "I’m sorry, but I cannot provide classified or sensitive information.";

    // Common queries and small talk
  } else if (regexMatch(/tell me a joke|make me laugh|joke/)) {
    const jokes = [
      "Why don’t scientists trust atoms? Because they make up everything!",
      "What do you get when you cross a snowman and a vampire? Frostbite!",
      "Why don’t skeletons fight each other? They don’t have the guts!",
      "What do you call fake spaghetti? An impasta!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "How does a penguin build its house? Igloos it together!",
    ];
    response = jokes[Math.floor(Math.random() * jokes.length)];
  } else if (
    regexMatch(
      /what can you do|what are your capabilities|what can you assist with/
    )
  ) {
    response =
      "I can help with information related to the Request Management System and answer general questions. How can I assist you today?";
  } else if (regexMatch(/thank you|thanks|appreciate it|thankful/)) {
    response =
      "You’re welcome! If you have any other questions, feel free to ask.";
  } else if (regexMatch(/goodbye|bye|see you later|farewell/)) {
    response = "Goodbye! Have a great day!";
  } else {
    response =
      "I’m sorry, I didn’t quite understand that. Can you please rephrase your question or provide more details?";
  }

  return response;
};
