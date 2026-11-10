import type { ChatMessage } from "@shared/types";
import { http } from "../services/http";

export async function fetchChatHistory() {
  try {
    const response = await http.get<ChatMessage[]>("/chat");
    const chatHistory: ChatMessage[] = response.data
    return chatHistory;
  }
  catch (error) {
    console.error("Failed to fetch chat history with error - ", error);
    return null;
  }
}

