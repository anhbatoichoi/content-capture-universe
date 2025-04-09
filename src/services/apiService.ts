
interface ExtractContentRequest {
  url: string;
  title?: string;
  source?: string;
}

interface ExtractContentResponse {
  request_id: string;
  status: "pending" | "done" | "failed";
  content?: string;
  error?: string;
}

interface CheckStatusResponse {
  request_id: string;
  status: "pending" | "done" | "failed";
  content?: string;
  error?: string;
}

// This would be your actual API endpoint
const API_BASE_URL = "https://your-backend-api.com";

export const apiService = {
  extractContent: async (data: ExtractContentRequest): Promise<ExtractContentResponse> => {
    try {
      // In a real implementation, this would be a fetch to your backend
      // For demo purposes, we'll simulate an API call
      console.log("Sending extract content request:", data);
      
      // Simulate API call delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            request_id: `req_${Date.now()}`,
            status: "pending"
          });
        }, 1000);
      });
    } catch (error) {
      console.error("Error extracting content:", error);
      throw error;
    }
  },

  checkStatus: async (requestId: string): Promise<CheckStatusResponse> => {
    try {
      console.log("Checking status for request:", requestId);
      
      // Simulate API call delay and randomly return done status after a few calls
      return new Promise((resolve) => {
        setTimeout(() => {
          // Randomly determine if the task is complete (for demo purposes)
          // In reality this would check with your backend
          const isDone = Math.random() > 0.7;
          
          if (isDone) {
            resolve({
              request_id: requestId,
              status: "done",
              content: "# Extracted Content\n\nThis is some sample markdown content that was extracted.\n\n## Section 1\n\nSome details here...\n\n## Section 2\n\nMore information..."
            });
          } else {
            resolve({
              request_id: requestId,
              status: "pending"
            });
          }
        }, 500);
      });
    } catch (error) {
      console.error("Error checking status:", error);
      throw error;
    }
  }
};
