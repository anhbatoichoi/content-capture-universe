
declare namespace chrome {
  namespace tabs {
    function query(queryInfo: { active: boolean, currentWindow: boolean }): Promise<chrome.tabs.Tab[]>;
    function sendMessage(tabId: number, message: any): Promise<any>;

    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      active: boolean;
      [key: string]: any;
    }
  }

  namespace runtime {
    const lastError: { message: string } | undefined;
    function sendMessage(message: any): Promise<any>;
    function onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response: any) => void) => void): void;
    };
  }

  namespace storage {
    namespace local {
      function get(keys: string | string[] | null): Promise<{ [key: string]: any }>;
      function set(items: { [key: string]: any }): Promise<void>;
    }
  }

  namespace scripting {
    function executeScript(details: { target: { tabId: number }, files: string[] }): Promise<any>;
  }
}
