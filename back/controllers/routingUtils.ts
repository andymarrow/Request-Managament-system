export const handleChatbotMessage = (message) => {
    const lowerMessage = message.toLowerCase().trim();

    // Keyword matching for specific actions (e.g., navigation)
    if (lowerMessage.includes("history") &&
        (lowerMessage.includes("request") || lowerMessage.includes("completed") ||
            lowerMessage.includes("rejected") || lowerMessage.includes("approved") ||
            lowerMessage.includes("accepted"))) {
        return "navigate:/employee/emp_dashboard";
    }

    if ((lowerMessage.includes("problem") || lowerMessage.includes("issue")) &&
        (lowerMessage.includes("solve") || lowerMessage.includes("search") || lowerMessage.includes("fix"))) {
        return "navigate:/employee/SearchProblem";
    }

    // Check for logout or sending back to login page
    if (lowerMessage.includes("log me out") || lowerMessage.includes("send me back to the login page")) {
        return "navigate:http://localhost:3000/auth/Home";
    }

    // Default response if no match is found
    return "Sorry, I didn't understand that.";
};
