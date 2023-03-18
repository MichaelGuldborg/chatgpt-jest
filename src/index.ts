import {ChatGPTUnofficialProxyAPI} from 'chatgpt'
import fetch from 'node-fetch';
import fs from 'fs';


const accessToken = process.env.CHAT_GPT_ACCESS_TOKEN ?? '';
const api = new ChatGPTUnofficialProxyAPI({
    accessToken: accessToken,
    apiReverseProxyUrl: 'https://bypass.duti.tech/api/conversation',
    fetch,
})

const args: string[] = process.argv;
const disabled = false;
const path = args[args.length - 1] ?? './src'

const regex = /(```[\S\s]*?```)/g;
const sanitize = (s: string) => {
    // find code snippet
    const matches = s.match(regex);
    const snippet = matches?.[0].toString();
    if (!snippet) return undefined;

    // remove first and last line
    const lines = snippet?.split('\n');
    return lines.slice(1, lines.length - 1).join('\n');

}

const createTestFile = async (filepath: string) => {
    const outputPath = filepath.replace('.ts', '.test.ts');

    // skip files that already have test
    if (fs.existsSync(outputPath)) return;

    // perform a dry run
    if (disabled) return console.log(`DISABLED: ${filepath}`);

    const input = fs.readFileSync(filepath, {encoding: 'utf8'});
    const message = `Write a test with the jest library. The answer should only be a code snippet. The test should cover this code "\n${input}\n"`;
    const response = await api.sendMessage(message);
    const output = sanitize(response.text);
    if (!output) return console.log(`INVALID: ${filepath}`);
    fs.writeFileSync(outputPath, output);
    console.log(`CREATED: ${filepath}`);
}

const createTestFolder = async (path: string) => {
    if (fs.lstatSync(path).isFile()) {
        return await createTestFile(path);
    }


    const files = fs.readdirSync(path).filter((file) => {
        if (file === 'index.ts') return false;
        return !file.includes('test');
    });

    for (const file of files) {
        await createTestFolder(`${path}/${file}`);
    }
}


Promise.resolve().then(async () => {
    await createTestFolder(path);
    console.log('COMPLETE');
})