import OpenAI from 'openai';

interface IConfig {
  model: string;
  apiKey: string;
};

let config: IConfig | undefined;

let openAIClient: OpenAI | null = null;


export const isOpenAIClientInitialized = () => openAIClient !== null;

export const getOpenAIClient = () => openAIClient;

export const setOpenAIConfig = ({ model, apiKey }: { model: string, apiKey: string }) => {
  config = { model, apiKey };
}

export const initializeOpenAIClient = async () => {
  if (typeof config === 'undefined') throw new Error('OpenAI config is not set');

  openAIClient = new OpenAI({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });

  await openAIClient.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  });
}
