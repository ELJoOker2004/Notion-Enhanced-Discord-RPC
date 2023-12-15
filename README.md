# Discord RPC for Notion Enhanced

This is a guide on how to set up Discord Rich Presence for the **Notion Enhanced** application.

## How to Use

### 1. Download the Repository

First, ensure that you have the `app` folder in your **`Notion Enhanced/resources`** directory. If it's not present, follow these steps:

- Install `npm` and `npx` if you haven't already.
- Open your command prompt and run the following command:

```cmd
npx @electron/asar extract "%localappdata%\Programs\Notion Enhanced\resources\app.asar" "%localappdata%\Programs\Notion Enhanced\resources\app"
```
**note:** the above command expects you to have notion in this directory (this means you've chosen `install just for me` option when installing) if not then edit it to your **app.asar** directory

### 2. Copy the Resources Folder
- Next, copy the `resources` folder into your Notion Enhanced directory.

#### if you encountered any problem or question feel free to open an issue or contact me directly on Discord: **@eljooker**
#### suggestion are welcomed

inispired by [Discord-RPC-for-Notion](https://github.com/Mizari-W/Discord-RPC-for-Notion.git)
