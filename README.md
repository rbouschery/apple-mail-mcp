# Apple Mail MCP

An MCP (Model Context Protocol) server for Apple Mail on macOS. Allows AI assistants like Claude to read, search, and send emails through Apple Mail.

## Features

- **List Accounts** - Get all configured email accounts
- **List Mailboxes** - Get all mailboxes/folders for any account
- **Get Emails** - Retrieve recent emails from any mailbox
- **Search Emails** - Search by subject, sender, or content
- **Unread Count** - Get unread email counts
- **Send Email** - Compose and send emails with CC/BCC support

## Requirements

- macOS (uses AppleScript to communicate with Apple Mail)
- [Bun](https://bun.sh/) runtime
- Apple Mail app configured with at least one email account

## Installation

### From Source

```bash
git clone https://github.com/yourusername/apple-mail-mcp.git
cd apple-mail-mcp
bun install
```

### Using bunx (no installation required)

```bash
bunx apple-mail-mcp
```

## Configuration

### Claude Code

Add to your `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "apple-mail": {
      "command": "bun",
      "args": ["run", "/path/to/apple-mail-mcp/src/index.ts"]
    }
  }
}
```

Or if published to npm:

```json
{
  "mcpServers": {
    "apple-mail": {
      "command": "bunx",
      "args": ["apple-mail-mcp"]
    }
  }
}
```

After adding the configuration, restart Claude Code for the changes to take effect.

### Cursor

Add to your Cursor MCP settings (Settings > MCP Servers):

```json
{
  "mcpServers": {
    "apple-mail": {
      "command": "bun",
      "args": ["run", "/path/to/apple-mail-mcp/src/index.ts"]
    }
  }
}
```

Or via Cursor's settings UI:
1. Open Cursor Settings (`Cmd + ,`)
2. Search for "MCP" or navigate to Extensions > MCP Servers
3. Click "Add Server"
4. Enter:
   - **Name**: `apple-mail`
   - **Command**: `bun`
   - **Arguments**: `run`, `/path/to/apple-mail-mcp/src/index.ts`

### Claude Desktop

Add to your `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apple-mail": {
      "command": "bun",
      "args": ["run", "/path/to/apple-mail-mcp/src/index.ts"]
    }
  }
}
```

## Available Tools

### `mail_list_accounts`

List all email accounts configured in Apple Mail.

```
No parameters required
```

**Example response:**
```json
{
  "accounts": ["personal@gmail.com", "iCloud", "work@company.com"]
}
```

### `mail_list_mailboxes`

List all mailboxes for a specific account or all accounts.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | No | Account name to list mailboxes for |

**Example response:**
```json
{
  "mailboxes": [
    {
      "account": "iCloud",
      "mailboxes": ["INBOX", "Drafts", "Sent Messages", "Archive", "Junk"]
    }
  ]
}
```

### `mail_get_emails`

Get recent emails from a mailbox.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `account` | string | No | - | Account name |
| `mailbox` | string | No | "INBOX" | Mailbox name |
| `limit` | number | No | 10 | Max emails to retrieve |
| `includeContent` | boolean | No | false | Include email body |

**Example response:**
```json
{
  "emails": [
    {
      "id": 12345,
      "subject": "Meeting tomorrow",
      "sender": "John Doe <john@example.com>",
      "dateSent": "Monday, 10. January 2025 at 09:30:00",
      "isRead": false
    }
  ],
  "count": 1
}
```

### `mail_search`

Search emails by subject, sender, or content.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | **Yes** | - | Search query |
| `account` | string | No | - | Limit search to account |
| `mailbox` | string | No | - | Limit search to mailbox |
| `limit` | number | No | 10 | Max results |

### `mail_get_unread_count`

Get the count of unread emails.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | No | Account name |
| `mailbox` | string | No | Mailbox name |

**Example response:**
```json
{
  "unreadCount": 42
}
```

### `mail_send`

Send an email using Apple Mail.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string or string[] | **Yes** | Recipient email(s) |
| `subject` | string | **Yes** | Email subject |
| `body` | string | **Yes** | Email body |
| `cc` | string or string[] | No | CC recipient(s) |
| `bcc` | string or string[] | No | BCC recipient(s) |
| `from` | string | No | Sender (must be configured account) |

**Example response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

## Permissions

On first use, macOS will prompt you to grant permissions:
1. **Automation** - Allow the terminal/app to control Apple Mail
2. **Mail Access** - Allow access to your email data

You can manage these in System Settings > Privacy & Security > Automation.

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Run the server
bun run start
```

## Troubleshooting

### "No accounts found"
- Ensure Apple Mail is running and has at least one account configured
- Check that automation permissions are granted in System Settings

### "Operation not permitted"
- Grant automation permissions: System Settings > Privacy & Security > Automation
- Ensure the terminal/app running the MCP server has permission to control Mail

### Server not connecting
- Restart your AI client (Claude Code, Cursor, etc.) after adding the MCP configuration
- Verify the path to the server is correct in your configuration
- Check that Bun is installed and accessible from your PATH

## License

MIT

## Credits

Built as an alternative to [apple-mcp](https://github.com/Dhravya/apple-mcp) with working mail operations using direct AppleScript execution.
