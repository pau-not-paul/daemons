import { serialize } from '../utils/slateUtils';
import { Editor } from 'slate';
import { IComment, IDaemon } from '../types';

const isAtTheBottom = ({ editor, comment }: { editor: Editor, comment: IComment }) => {
  const wholeText = serialize(editor.children);
  const lengthTextBefore = wholeText.split(comment.exactTextToHighlight)?.[0]?.length || 0;
  const lengthTextAfter = wholeText.split(comment.exactTextToHighlight)?.[1]?.length || 0;
  return lengthTextBefore > 150 && lengthTextAfter < 100 && lengthTextAfter < lengthTextBefore;
}

export const DaemonPopup = (
  { showPopup, daemon, comment, editor, ignoreComment }:
    {
      showPopup: boolean,
      daemon: IDaemon,
      comment: IComment,
      editor: Editor,
      ignoreComment: (comment: IComment) => void,
    }
) => (
  <div
    style={
      isAtTheBottom({ editor, comment }) ?
        {
          position: 'absolute',
          zIndex: 1000,
          pointerEvents: showPopup ? 'auto' : 'none',
          bottom: '100%',
          paddingBottom: '10px',
        } : {
          position: 'absolute',
          zIndex: 1000,
          pointerEvents: showPopup ? 'auto' : 'none',
          top: '100%',
          paddingTop: '10px',
        }
    }
  >
    <div
      contentEditable={false}
      style={{
        backgroundColor: 'white',
        overflow: 'hidden',
        width: '400px',
        maxWidth: '400px',
        border: `1px solid ${daemon.highlightColor}`,
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        opacity: showPopup ? 1 : 0,
        transform: showPopup ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        color: daemon.color,
        userSelect: 'none',
      }}
      className='p-3 font-medium font-sans text-sm'
    >
      <div className='flex'>
        <div style={{ backgroundColor: daemon.color }} className={`rounded-full h-[10px] w-[10px] min-w-[10px] mt-1 mr-3`}>
        </div>
        <div>{comment.commentText}</div>
      </div>
      <div className='flex justify-end'>
        <button
          className='mt-2 text-sm text-neutral-500 border border-neutral-200 rounded-md px-3 py-1 hover:bg-gray-50'
          onClick={() => ignoreComment(comment)}>
          Ignore
        </button>
      </div>
    </div>
  </div>
)
