import { useRef, useState } from 'react';
import { clearComment, clearCommentCurrentPosition, initialText } from '../utils/slateUtils';
import { Editable, Slate, withReact } from 'slate-react';
import { createEditor } from 'slate';
import { isOpenAIClientInitialized } from '../utils/openAIUtils';
import { IComment } from '../types';
import { Daemons, MMMOCK_DATA, summonDaemons } from './Daemons';
import { Leaf } from './Leaf';

export const Editor = (
  { configModalOpen, setConfigModalOpen }: {
    configModalOpen: boolean;
    setConfigModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
  const [allDaemonsSummoned, setAllDaemonsSummoned] = useState(false);
  const [ignoredComments, setIgnoredComments] = useState<IComment[]>([]);
  const [editor] = useState(() => withReact(createEditor()));
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyUp = () => {
    clearCommentCurrentPosition({ editor });

    if (typingTimer.current) clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(async () => {
      if (!isOpenAIClientInitialized()) return;
      setAllDaemonsSummoned(true);
      await summonDaemons({ editor, ignoredComments });
      setAllDaemonsSummoned(false);
    }, MMMOCK_DATA ? 0 : 1000);
  };

  const ignoreComment = (comment: IComment) => {
    setIgnoredComments([...ignoredComments, comment]);
    clearComment({ editor, comment });
  };

  return (
    <div className='w-full flex-grow flex justify-center items-center'>
      <div className='flex justify-center items-start'>
        <Slate editor={editor} initialValue={initialText}>
          <Editable
            className='bg-white w-[520px] min-h-[360px] max-h-[90vh] overflow-scroll rounded-md text-xl text-neutral-600 p-8 outline-none'
            style={{ fontFamily: `"Times New Roman", Times, serif` }}
            onKeyUp={handleKeyUp}
            renderLeaf={(props) => <Leaf {...props} ignoreComment={ignoreComment} editor={editor} />}
          />
        </Slate>
        <div className='ml-6 mt-4'>
          <Daemons
            editor={editor}
            ignoredComments={ignoredComments}
            allDaemonsSummoned={allDaemonsSummoned}
          />
          <NoApiKeyWarning configModalOpen={configModalOpen} setConfigModalOpen={setConfigModalOpen} />
        </div>
      </div>
    </div>
  )
};

const NoApiKeyWarning = (
  { configModalOpen, setConfigModalOpen }: {
    configModalOpen: boolean;
    setConfigModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => (
  !configModalOpen && !isOpenAIClientInitialized() && (
    <div className='mt-6 text-gray-600'>
      Without an API key, the daemons <br />
      can't be summoned.
      <button className='ml-1 underline hover:text-black' onClick={() => setConfigModalOpen(true)}>
        Add key
      </button>.
    </div>
  )
)
