import { useState } from 'react'
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { serialize, findText, addComment } from '../utils/slateUtils';
import { getOpenAIClient, isOpenAIClientInitialized } from '../utils/openAIUtils';
import { IComment, IDaemon } from '../types/index';
import { Editor, Descendant, Element } from 'slate';

export const MMMOCK_DATA = false;

const getCursorClass = ({ isProcessing }: { isProcessing: Boolean }) => {
  if (isProcessing) return 'cursor-progress';
  if (!isOpenAIClientInitialized()) return 'cursor-not-allowed';
  return 'cursor-pointer';
}

export const Daemons = (
  { editor, ignoredComments, allDaemonsSummoned }:
    { editor: Editor, ignoredComments: IComment[], allDaemonsSummoned: Boolean }
) => {
  const [daemons, _setDaemons] = useState<IDaemon[]>(defaultDaemons)
  const [summonedDaemonsIds, setSummonedDaemonsIds] = useState<String[]>([]);

  return (
    <div className='flex flex-col gap-2'>
      {daemons.map((daemon) => {
        const isProcessing = summonedDaemonsIds.includes(daemon.id) || allDaemonsSummoned;

        return (
          <div
            key={daemon.id}
            className={`flex items-center gap-2 group ${getCursorClass({ isProcessing })} ${isProcessing ? 'animate-pulse' : ''}`}
            onClick={async () => {
              if (isProcessing) return;
              if (!isOpenAIClientInitialized()) return;
              setSummonedDaemonsIds(prev => [...prev, daemon.id]);
              await summonDaemon({ editor, ignoredComments, daemon });
              setSummonedDaemonsIds(prev => prev.filter(id => id !== daemon.id));
            }}
          >
            <div style={{ backgroundColor: daemon.color }} className='rounded-full h-5 w-5'>
            </div>
            <div style={{ color: daemon.color }} className='opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium'>
              {daemon.name}
            </div>
          </div>
        );
      })}
    </div>
  )
};

const DaemonResponse = z.object({
  exactTextToHighlight: z.string(),
  commentText: z.string(),
  daemonId: z.string(),
});

const callOpenAI = async (content: string) => {
  if (MMMOCK_DATA) {
    return {
      'id': 'chatcmpl-9ulWaJd7h6bEs6tvbGB34pkG8eIK6',
      'object': 'chat.completion',
      'created': 1723316080,
      'model': 'gpt-4o-mini-2024-07-18',
      'choices': [
        {
          'index': 0,
          'message': {
            'role': 'assistant',
            'content': `{'exactTextToHighlight':'we can't treat them as a reliable source of knowledge.','commentText':'Are you sure about that? What if there are contexts where they can provide valuable insights?','daemonId':'devils_advocate'}`,
            'refusal': null
          },
          'logprobs': null,
          'finish_reason': 'stop'
        }
      ],
      'usage': {
        'prompt_tokens': 191,
        'completion_tokens': 43,
        'total_tokens': 234
      },
      'system_fingerprint': 'fp_507c9469a1'
    };
  }

  const openAIClient = getOpenAIClient();

  if (!openAIClient) throw new Error('OpenAI client is not initialized');

  return await openAIClient.chat.completions.create({
    messages: [{ role: 'user', content }],
    model: 'gpt-4o-mini',
    response_format: zodResponseFormat(DaemonResponse, 'daemonResponse'),
  });
};

export const defaultDaemons: IDaemon[] = [
  { id: 'devils_advocate', name: `DEVIL'S ADVOCATE`, color: '#6484e0', highlightColor: '#6484e055', description: `Challenges your logic and encourages you to consider different perspectives.` },
  { id: 'researcher', name: 'RESEARCHER', color: '#9a71ec', highlightColor: '#9a71ec55', description: `Provides facts and studies to strengthen your arguments.` },
  { id: 'supporter', name: 'SUPPORTER', color: '#e279e7', highlightColor: '#e279e755', description: `Boosts your confidence, offering encouragement and positive reinforcement.` },
  { id: 'synthesizer', name: 'SYNTHESIZER', color: '#e47687', highlightColor: '#e4768755', description: `Simplifies complex ideas, helping you express them more concisely.` },
  { id: 'elaborator', name: 'ELABORATOR', color: '#ea9d5f', highlightColor: '#ea9d5f55', description: `Expands on your ideas, adding depth and detail where needed.` },
];

const alreadyMadeComments = (
  { editor, ignoredComments }:
    { editor: Editor, ignoredComments: IComment[] }
) => {
  const visibleComments = editor.children.map(
    (paragraph: Descendant) => {
      if (Element.isElementType(paragraph, 'paragraph')) {
        return paragraph.children.map((word) => 'comment' in word ? word.comment : null).filter(Boolean);
      }
      return [];
    }
  ).flat().filter(Boolean);

  return [...visibleComments, ...ignoredComments];
}

const generatePrompt = (
  { editor, ignoredComments, daemon }:
    { editor: Editor, ignoredComments: IComment[], daemon: IDaemon | undefined }) => {
  const promptArray = [
    'This is an AI powered text editor. It has multiple daemons that proactively provide feedback to the user.',
    `You should only provide one single comment. Do not change any character in the text, it has to be exactly the same even if there are typos. Don't change capitalization.Don't select more than one line.`,
  ];

  if (daemon) {
    promptArray.push('Only one daemon is summoned at a time.');
    promptArray.push(`DaemonID = '${daemon.id}': ${daemon.description}`);
  } else {
    promptArray.push('Only one daemon is summoned at a time, pick the one with the most important feedback.');
    promptArray.push('Daemons: ' + defaultDaemons.map(({ id, description }) => `DaemonID = '${id}': ${description}`).join(', '));
  }

  promptArray.push('Do not repeat any of the following comments: ' +
    alreadyMadeComments({ editor, ignoredComments }).map(c => JSON.stringify(c)).join(', ')
  );

  promptArray.push(`This is the user's text: \n` + serialize(editor.children));

  return promptArray.join('\n');
};

const summonDaemon = async (
  { editor, ignoredComments, daemon }:
    { editor: Editor, ignoredComments: IComment[], daemon: IDaemon }
) => {
  const prompt = generatePrompt({ editor, ignoredComments, daemon });
  await callOpenAIAndProcressResponse({ editor, prompt });
};

export const summonDaemons = async ({ editor, ignoredComments }: { editor: Editor, ignoredComments: IComment[] }) => {
  const prompt = generatePrompt({ editor, ignoredComments, daemon: undefined });
  await callOpenAIAndProcressResponse({ editor, prompt });
};

const callOpenAIAndProcressResponse = async ({ editor, prompt }: { editor: Editor, prompt: string }) => {
  const response = await callOpenAI(prompt);
  const comment = JSON.parse(response.choices[0].message.content || '');

  if (!comment.exactTextToHighlight) {
    console.log(`No exactTextToHighlight found. comment: ${JSON.stringify(comment)}`);
    return;
  }

  const result = findText(editor, comment.exactTextToHighlight);
  if (result) {
    const { anchor, focus } = result;
    addComment({ editor, anchor, focus, comment });
  } else {
    console.log(`Text not found. exactTextToHighlight: ${comment.exactTextToHighlight}`);
  }
}
