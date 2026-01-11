import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const MAIL_LIST_ACCOUNTS: Tool = {
  name: "mail_list_accounts",
  description: "List all email accounts configured in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export const MAIL_LIST_MAILBOXES: Tool = {
  name: "mail_list_mailboxes",
  description: "List all mailboxes (folders) for a specific account or all accounts in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      account: {
        type: "string",
        description: "The name of the email account to list mailboxes for. If not provided, lists mailboxes for all accounts.",
      },
    },
    required: [],
  },
};

export const MAIL_GET_EMAILS: Tool = {
  name: "mail_get_emails",
  description: "Get recent emails from a mailbox in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder (default: INBOX)",
        default: "INBOX",
      },
      limit: {
        type: "number",
        description: "Maximum number of emails to retrieve (default: 10)",
        default: 10,
      },
      includeContent: {
        type: "boolean",
        description: "Whether to include the email body content (default: false)",
        default: false,
      },
      unreadOnly: {
        type: "boolean",
        description: "Only return unread emails (default: false)",
        default: false,
      },
    },
    required: [],
  },
};

export const MAIL_GET_EMAILS_BY_IDS: Tool = {
  name: "mail_get_emails_by_ids",
  description: "Get specific emails by their IDs in Apple Mail. Use this to retrieve full details of specific emails after browsing with mail_get_emails (includeContent: false).",
  inputSchema: {
    type: "object",
    properties: {
      ids: {
        type: "array",
        items: {
          type: "number",
        },
        description: "Array of email IDs to retrieve (obtained from mail_get_emails or mail_search)",
      },
      account: {
        type: "string",
        description: "The name of the email account (helps optimize search)",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder where the emails are located (default: INBOX, helps optimize search)",
        default: "INBOX",
      },
      includeContent: {
        type: "boolean",
        description: "Whether to include the email body content (default: true)",
        default: true,
      },
    },
    required: ["ids"],
  },
};

export const MAIL_SEARCH: Tool = {
  name: "mail_search",
  description: "Search emails in Apple Mail by subject, sender, or content",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to match against email subject, sender, or content",
      },
      account: {
        type: "string",
        description: "The name of the email account to search in",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder to search in",
      },
      limit: {
        type: "number",
        description: "Maximum number of emails to return (default: 10)",
        default: 10,
      },
    },
    required: ["query"],
  },
};

export const MAIL_GET_UNREAD_COUNT: Tool = {
  name: "mail_get_unread_count",
  description: "Get the count of unread emails in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder",
      },
    },
    required: [],
  },
};

export const MAIL_SEND: Tool = {
  name: "mail_send",
  description: "Send an email using Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      to: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) of the recipient(s)",
      },
      subject: {
        type: "string",
        description: "The email subject line",
      },
      body: {
        type: "string",
        description: "The email body content",
      },
      cc: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) for CC recipients",
      },
      bcc: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) for BCC recipients",
      },
      from: {
        type: "string",
        description: "The sender email address (must be a configured account)",
      },
    },
    required: ["to", "subject", "body"],
  },
};

export const MAIL_ARCHIVE: Tool = {
  name: "mail_archive",
  description: "Archive an email in Apple Mail by moving it to the Archive mailbox",
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "number",
        description: "The ID of the email message to archive (obtained from mail_get_emails or mail_search)",
      },
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder where the email currently is (default: INBOX)",
        default: "INBOX",
      },
      archiveMailbox: {
        type: "string",
        description: "The name of the archive mailbox to move the email to (default: auto-detects 'Archive', 'Archives', or 'All Mail')",
      },
    },
    required: ["messageId"],
  },
};

export const MAIL_DELETE: Tool = {
  name: "mail_delete",
  description: "Delete an email in Apple Mail by moving it to the Trash mailbox",
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "number",
        description: "The ID of the email message to delete (obtained from mail_get_emails or mail_search)",
      },
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder where the email currently is (default: INBOX)",
        default: "INBOX",
      },
    },
    required: ["messageId"],
  },
};

export const MAIL_MARK_READ: Tool = {
  name: "mail_mark_read",
  description: "Mark an email as read in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "number",
        description: "The ID of the email message to mark as read (obtained from mail_get_emails or mail_search)",
      },
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder where the email is (default: INBOX)",
        default: "INBOX",
      },
    },
    required: ["messageId"],
  },
};

export const MAIL_MARK_UNREAD: Tool = {
  name: "mail_mark_unread",
  description: "Mark an email as unread in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "number",
        description: "The ID of the email message to mark as unread (obtained from mail_get_emails or mail_search)",
      },
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder where the email is (default: INBOX)",
        default: "INBOX",
      },
    },
    required: ["messageId"],
  },
};

export const MAIL_CREATE_DRAFT: Tool = {
  name: "mail_create_draft",
  description: "Create a new draft email in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      to: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) of the recipient(s)",
      },
      subject: {
        type: "string",
        description: "The email subject line",
      },
      body: {
        type: "string",
        description: "The email body content",
      },
      cc: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) for CC recipients",
      },
      bcc: {
        oneOf: [
          { type: "string" },
          { type: "array", items: { type: "string" } },
        ],
        description: "Email address(es) for BCC recipients",
      },
      from: {
        type: "string",
        description: "The sender email address (must be a configured account)",
      },
    },
    required: ["subject", "body"],
  },
};

export const MAIL_CREATE_DRAFT_REPLY: Tool = {
  name: "mail_create_draft_reply",
  description: "Create a draft reply to an existing email in Apple Mail",
  inputSchema: {
    type: "object",
    properties: {
      messageId: {
        type: "number",
        description: "The ID of the email message to reply to (obtained from mail_get_emails or mail_search)",
      },
      body: {
        type: "string",
        description: "The reply body content",
      },
      replyAll: {
        type: "boolean",
        description: "Whether to reply to all recipients (default: false)",
        default: false,
      },
      account: {
        type: "string",
        description: "The name of the email account",
      },
      mailbox: {
        type: "string",
        description: "The name of the mailbox/folder where the original email is (default: INBOX)",
        default: "INBOX",
      },
    },
    required: ["messageId", "body"],
  },
};

export const tools: Tool[] = [
  MAIL_LIST_ACCOUNTS,
  MAIL_LIST_MAILBOXES,
  MAIL_GET_EMAILS,
  MAIL_GET_EMAILS_BY_IDS,
  MAIL_SEARCH,
  MAIL_GET_UNREAD_COUNT,
  MAIL_SEND,
  MAIL_ARCHIVE,
  MAIL_DELETE,
  MAIL_MARK_READ,
  MAIL_MARK_UNREAD,
  MAIL_CREATE_DRAFT,
  MAIL_CREATE_DRAFT_REPLY,
];
