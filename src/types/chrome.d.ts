
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
    const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response: any) => void) => void): void;
    };
  }

  namespace storage {
    namespace local {
      function get(keys: string | string[] | null | undefined): Promise<{ [key: string]: any }>;
      function set(items: { [key: string]: any }): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
    }
  }

  namespace scripting {
    function executeScript(details: { target: { tabId: number }, files: string[] }): Promise<any>;
  }

  namespace action {
    const onClicked: {
      addListener(callback: (tab: chrome.tabs.Tab) => void): void;
    };
  }

  namespace sidePanel {
    function open(options?: { tabId?: number }): Promise<void>;
    function setOptions(options: { enabled: boolean, path?: string }): Promise<void>;
  }
}
